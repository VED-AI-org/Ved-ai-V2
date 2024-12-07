import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button, Container, Grid } from "@mui/material";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaWallet } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { keyframes } from "@mui/system";

const socialPulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255,255,255,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
`;

const Socials = () => {
  const { state } = useLocation();
  const [name, setName] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState({
    github: false,
    linkedin: false,
    twitter: false,
    instagram: false,
    metamask: false
  });
  const [account, setAccount] = useState(null);
  const email = state?.email;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchName = async () => {
      if (!email) {
        console.error("No email provided");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("answers")
          .select("answer")
          .eq("email", email)
          .eq("question_number", 2);

        if (error) throw error;

        if (data.length > 0) {
          const userName = data[0].answer;
          setName(userName || "");
        }
      } catch (error) {
        console.error("Error fetching name: ", error);
      }
    };

    const checkExistingConnections = async () => {
      if (!email) return;

      try {
        // Check GitHub connection
        const { data: githubData } = await supabase
          .from("github_accounts")
          .select("*")
          .eq("email", email)
          .single();

        // Check LinkedIn connection
        const { data: linkedinData } = await supabase
          .from("linkedin_accounts")
          .select("*")
          .eq("email", email)
          .single();

        // Check Twitter connection
        const { data: twitterData } = await supabase
          .from("twitter_accounts")
          .select("*")
          .eq("email", email)
          .single();

        // Check Instagram connection
        const { data: instagramData } = await supabase
          .from("instagram_accounts")
          .select("*")
          .eq("email", email)
          .single();

        setConnectedAccounts({
          github: !!githubData,
          linkedin: !!linkedinData,
          twitter: !!twitterData,
          instagram: !!instagramData,
          metamask: false // This will be updated separately
        });
      } catch (error) {
        console.error("Error checking existing connections:", error);
      }
    };

    fetchName();
    checkExistingConnections();
  }, [email]);

  const checkMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setConnectedAccounts(prev => ({ ...prev, metamask: true }));
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnectedAccounts(prev => ({ ...prev, metamask: true }));
        } else {
          setAccount(null);
          setConnectedAccounts(prev => ({ ...prev, metamask: false }));
        }
      });
    }
  }, []);

  const handleSocialConnect = async (provider) => {
    const providerMap = {
      github: async () => {
        const { user, session, error } = await supabase.auth.signInWithOAuth({
          provider: "github",
        });

        if (error) {
          console.error("GitHub login error:", error);
          return false;
        }

        if (session && user) {
          try {
            await supabase
              .from("github_accounts")
              .upsert({
                email: email,
                github_id: user.user_metadata.user_id,
                github_username: user.user_metadata.user_name,
                github_avatar: user.user_metadata.avatar_url,
              });

            return true;
          } catch (error) {
            console.error("Error saving GitHub data:", error);
            return false;
          }
        }
        return false;
      },
      linkedin: async () => {
        const { user, session, error } = await supabase.auth.signInWithOAuth({
          provider: "linkedin",
        });

        if (error) {
          console.error("LinkedIn login error:", error);
          return false;
        }

        if (session && user) {
          try {
            await supabase
              .from("linkedin_accounts")
              .upsert({
                email: email,
                linkedin_id: user.user_metadata.user_id,
                linkedin_username: user.user_metadata.user_name,
                linkedin_avatar: user.user_metadata.avatar_url,
              });

            return true;
          } catch (error) {
            console.error("Error saving LinkedIn data:", error);
            return false;
          }
        }
        return false;
      },
      twitter: async () => {
        const { user, session, error } = await supabase.auth.signInWithOAuth({
          provider: "twitter",
        });

        if (error) {
          console.error("Twitter login error:", error);
          return false;
        }

        if (session && user) {
          try {
            await supabase
              .from("twitter_accounts")
              .upsert({
                email: email,
                twitter_id: user.user_metadata.user_id,
                twitter_username: user.user_metadata.user_name,
                twitter_avatar: user.user_metadata.avatar_url,
              });

            return true;
          } catch (error) {
            console.error("Error saving Twitter data:", error);
            return false;
          }
        }
        return false;
      },
      instagram: async () => {
        const { user, session, error } = await supabase.auth.signInWithOAuth({
          provider: "instagram",
        });

        if (error) {
          console.error("Instagram login error:", error);
          return false;
        }

        if (session && user) {
          try {
            await supabase
              .from("instagram_accounts")
              .upsert({
                email: email,
                instagram_id: user.user_metadata.user_id,
                instagram_username: user.user_metadata.user_name,
                instagram_avatar: user.user_metadata.avatar_url,
              });

            return true;
          } catch (error) {
            console.error("Error saving Instagram data:", error);
            return false;
          }
        }
        return false;
      }
    };

    const connectFunction = providerMap[provider];
    if (connectFunction) {
      const success = await connectFunction();
      if (success) {
        setConnectedAccounts(prev => ({ ...prev, [provider]: true }));
      }
    }
  };

  const allConnected = Object.values(connectedAccounts).every(v => v === true);

  const socialButtons = [
    { 
      provider: 'github',
      icon: FaGithub, 
      color: connectedAccounts.github ? "#4CAF50" : "#ffffff", 
      connected: connectedAccounts.github, 
      onClick: () => handleSocialConnect('github') 
    },
    { 
      provider: 'linkedin',
      icon: FaLinkedin, 
      color: connectedAccounts.linkedin ? "#0077B5" : "#ffffff", 
      connected: connectedAccounts.linkedin, 
      onClick: () => handleSocialConnect('linkedin') 
    },
    { 
      provider: 'twitter',
      icon: FaTwitter, 
      color: connectedAccounts.twitter ? "#1DA1F2" : "#ffffff", 
      connected: connectedAccounts.twitter, 
      onClick: () => handleSocialConnect('twitter') 
    },
    { 
      provider: 'instagram',
      icon: FaInstagram, 
      color: connectedAccounts.instagram ? "#E1306C" : "#ffffff", 
      connected: connectedAccounts.instagram, 
      onClick: () => handleSocialConnect('instagram') 
    },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        src="./socials.mp4"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontSize: { xs: "2rem", md: "3.5rem" },
              fontWeight: 600,
              marginBottom: "30px",
              color: "#ffffff",
            }}
          >
            {name
              ? `Hey, ${name}! Connect Your Socials`
              : "Hey, Connect Your Socials"}
          </Typography>

          <Grid 
            container 
            spacing={3} 
            justifyContent="center" 
            alignItems="center"
            sx={{ marginBottom: "30px" }}
          >
            {socialButtons.map((social, index) => (
              <Grid item key={index}>
                <IconButton
                  onClick={social.onClick}
                  sx={{
                    color: social.color,
                    fontSize: "3rem",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    padding: "15px",
                    transition: "all 0.3s ease",
                    animation: `${socialPulse} 2s infinite`,
                    opacity: social.connected ? 0.5 : 1,
                    "&:hover": {
                      transform: "scale(1.1)",
                      background: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  <social.icon />
                </IconButton>
              </Grid>
            ))}
          </Grid>

          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: "20px" 
            }}
          >
            <Button
              variant="contained"
              onClick={checkMetaMask}
              startIcon={<FaWallet />}
              sx={{
                backgroundColor: connectedAccounts.metamask ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontSize: "1rem",
                padding: "12px 24px",
                borderRadius: "50px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.4)",
                  transform: "translateY(-5px)",
                },
              }}
            >
              {connectedAccounts.metamask 
                ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` 
                : "Connect MetaMask"}
            </Button>

            {!allConnected && (
              <Button
                variant="outlined"
                onClick={() => navigate("/profile", { state: { email } })}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  padding: "10px 20px",
                  borderRadius: "50px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.8)",
                  },
                }}
              >
                Skip for Now
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Socials;