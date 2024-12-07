import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  useMediaQuery, 
  useTheme, 
  Container,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from './supabaseClient'; // Import the supabase client

const Ques = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const questions = [
    "What's your email address?",
    "What's your name?",
    "Select your professional domain",
  ];

  const domains = [
    "Tech", "Marketing", "Sales", "Design", "Finance", 
    "Healthcare", "Education", "Gaming", "Content Creation", "Data Science"
  ];

  const [displayedText, setDisplayedText] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    domain: "",
  });
  const [introCompleted, setIntroCompleted] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  
  // Supabase submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Typewriter effect
  const typeWriter = useCallback((text, callback) => {
    let currentText = "";
    let charIndex = 0;

    const type = () => {
      if (charIndex < text.length) {
        currentText += text[charIndex];
        setDisplayedText(currentText);
        charIndex++;
        setTimeout(type, 50);
      } else if (callback) {
        callback();
      }
    };

    type();
  }, []);

  // Typing effect for intro and questions
  useEffect(() => {
    if (!introCompleted) {
      typeWriter("Let's get you onboarded", () => {
        setTimeout(() => setIntroCompleted(true), 1000);
      });
    } else if (questions[currentQuestionIndex]) {
      typeWriter(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, introCompleted, typeWriter]);

  const handleSubmit = () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) return;

    const newFormData = { ...formData };

    if (currentQuestionIndex === 0) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedAnswer)) {
        alert("Please enter a valid email address");
        return;
      }
      newFormData.email = trimmedAnswer;
    } else if (currentQuestionIndex === 1) {
      // Name validation
      if (trimmedAnswer.length < 2) {
        alert("Please enter a valid name");
        return;
      }
      newFormData.name = trimmedAnswer;
    }

    setFormData(newFormData);
    setAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
  };

  const proceedToSocials = async () => {
    if (!selectedDomain) {
      alert("Please select a professional domain");
      return;
    }

    const finalFormData = {
      ...formData,
      domain: selectedDomain
    };

    try {
      setSubmitting(true);
      
      // Insert data into Supabase 'socials' table
      const { data, error } = await supabase
        .from('socials')
        .insert([
          {
            email: finalFormData.email,
            name: finalFormData.name,
            domain: finalFormData.domain,
            created_at: new Date()
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting data into Supabase:', error);
        throw error;
      }
      
      // Navigate to next page
      navigate("/socials", {
        state: finalFormData,
        replace: true,
      });
    } catch (error) {
      console.error('Error during submission:', error);
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionContent = () => {
    if (currentQuestionIndex === 2) {
      return (
        <motion.div
          key="domain-selection"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 3,
              mt: 6,
              mb: 6,
              maxWidth: "100%",
              overflowX: "auto",
              px: 3,
            }}
          >
            {domains.map((domain) => (
              <motion.div 
                key={domain} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                style={{ margin: '0.75rem' }}
              >
                <Button
                  variant={selectedDomain === domain ? "contained" : "outlined"}
                  onClick={() => handleDomainSelect(domain)}
                  sx={{
                    borderRadius: 6,
                    px: 4,
                    py: 2,
                    fontSize: isMobile ? "1rem" : "1.3rem",
                    whiteSpace: "nowrap",
                    backgroundColor: selectedDomain === domain 
                      ? "primary.main" 
                      : "transparent",
                    color: selectedDomain === domain ? "white" : "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: selectedDomain === domain 
                        ? "primary.dark" 
                        : "rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {domain}
                </Button>
              </motion.div>
            ))}
          </Box>
          {selectedDomain && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 6 
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={proceedToSocials}
                disabled={submitting}
                sx={{
                  borderRadius: 6,
                  px: 8,
                  py: 2,
                  fontSize: isMobile ? "1.2rem" : "1.5rem",
                }}
              >
                {submitting ? "Saving..." : "Next"}
              </Button>
            </Box>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        key="text-input"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label={questions[currentQuestionIndex]}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          sx={{
            "& .MuiInputBase-input": {
              color: "white",
              fontSize: isMobile ? "1.3rem" : "1.6rem",
              p: 2,
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255,255,255,0.7)",
              fontSize: isMobile ? "1.1rem" : "1.3rem",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: 4,
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.3)",
              },
              "&:hover fieldset": {
                borderColor: "white",
              },
              "&.Mui-focused fieldset": {
                borderColor: "white",
              },
            },
          }}
        />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 6 
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              borderRadius: 6,
              px: 8,
              py: 2,
              fontSize: isMobile ? "1.2rem" : "1.5rem",
            }}
          >
            Next
          </Button>
        </Box>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1,
          },
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/quess.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>

      <Container 
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          textAlign: "center",
          px: { xs: 3, sm: 5 },
        }}
      >
        <AnimatePresence mode="wait">
          {!introCompleted ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: isMobile ? "2.5rem" : "4rem",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  width: '100%',
                }}
              >
                {displayedText}
              </Typography>
            </motion.div>
          ) : (
            <>
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    mb: 6,
                    fontWeight: "bold",
                    color: "white",
                    fontSize: isMobile ? "1.8rem" : "2.5rem",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    width: '100%',
                  }}
                >
                  {displayedText}
                </Typography>
              </motion.div>
              {renderQuestionContent()}
            </>
          )}
        </AnimatePresence>
      </Container>

      {submitError && (
        <Snackbar 
          open={Boolean(submitError)} 
          autoHideDuration={6000} 
          onClose={() => setSubmitError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSubmitError(null)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {submitError}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default Ques;