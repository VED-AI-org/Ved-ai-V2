import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button, Container, Grid } from "@mui/material";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaWallet } from "react-icons/fa";
import { useLocation } from "react-router-dom";
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
    metamask: false,
  });
  const [account, setAccount] = useState(null);
  const email = state?.email;

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
          setName(data[0].answer || "");
        }
      } catch (error) {
        console.error("Error fetching name: ", error);
      }
    };

    const fetchConnections = async () => {
      if (!email) return;

      try {
        const socialTypes = ["github", "linkedin", "twitter", "instagram"];
        const updates = {};

        for (const type of socialTypes) {
          const { data } = await supabase
            .from(`${type}_accounts`)
            .select("*")
            .eq("email", email)
            .single();
          updates[type] = !!data;
        }

        setConnectedAccounts((prev) => ({ ...prev, ...updates }));
      } catch (error) {
        console.error("Error fetching social connections:", error);
      }
    };

    fetchName();
    fetchConnections();
  }, [email]);

  const handleSocialConnect = async (provider) => {
    try {
      const { user, session, error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) throw error;

      if (user && session) {
        const userMetadata = user.user_metadata;

        const upsertData = {
          email,
          [`${provider}_id`]: userMetadata.user_id,
          [`${provider}_username`]: userMetadata.user_name,
          [`${provider}_avatar`]: userMetadata.avatar_url,
        };

        const { error: upsertError } = await supabase
          .from(`${provider}_accounts`)
          .upsert(upsertData);

        if (upsertError) throw upsertError;

        setConnectedAccounts((prev) => ({ ...prev, [provider]: true }));
      }
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
    }
  };

  const handleMetaMaskConnect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const walletAddress = accounts[0];
        setAccount(walletAddress);

        const { error } = await supabase.from("metamask_accounts").upsert({
          email,
          wallet_address: walletAddress,
        });

        if (error) throw error;

        setConnectedAccounts((prev) => ({ ...prev, metamask: true }));
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const socialButtons = [
    {
      provider: "github",
      icon: FaGithub,
      color: connectedAccounts.github ? "#4CAF50" : "#ffffff",
      onClick: () => handleSocialConnect("github"),
    },
    {
      provider: "linkedin",
      icon: FaLinkedin,
      color: connectedAccounts.linkedin ? "#0077B5" : "#ffffff",
      onClick: () => handleSocialConnect("linkedin"),
    },
    {
      provider: "twitter",
      icon: FaTwitter,
      color: connectedAccounts.twitter ? "#1DA1F2" : "#ffffff",
      onClick: () => handleSocialConnect("twitter"),
    },
    {
      provider: "instagram",
      icon: FaInstagram,
      color: connectedAccounts.instagram ? "#E1306C" : "#ffffff",
      onClick: () => handleSocialConnect("instagram"),
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
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <Button
              variant="contained"
              onClick={handleMetaMaskConnect}
              startIcon={<FaWallet />}
              sx={{
                backgroundColor: connectedAccounts.metamask
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.2)",
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
                ? `Connected: ${account.substring(0, 6)}...${account.substring(
                    account.length - 4
                  )}`
                : "Connect MetaMask"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Socials;
