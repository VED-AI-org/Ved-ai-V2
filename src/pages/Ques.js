import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  useMediaQuery, 
  useTheme 
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Ques = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const questions = [
    "What's your email address?",
    "What's your name?",
    "Select your professional domain"
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
    domain: ""
  });

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

  // Restart video when it ends
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleVideoEnd = () => {
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play();
      }
    };

    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []);

  // Typing effect on question change
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      typeWriter(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, typeWriter]);

  // Handle form submission logic (same as previous version)
  const handleSubmit = () => {
    const trimmedAnswer = answer.trim();
    
    if (!trimmedAnswer) return;

    const newFormData = { ...formData };

    switch (currentQuestionIndex) {
      case 0:
        newFormData.email = trimmedAnswer;
        break;
      case 1:
        newFormData.name = trimmedAnswer;
        break;
      case 2:
        newFormData.domain = trimmedAnswer;
        break;
      default:
        break;
    }

    setFormData(newFormData);
    setAnswer("");

    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleDomainSelect = (domain) => {
    setFormData(prev => ({ ...prev, domain }));
    handleSubmit();
  };

  const handleFinalSubmit = () => {
    if (formData.domain) {
      navigate("/socials", {
        state: formData,
        replace: true
      });
    }
  };

  // Render question content (same as previous version)
  const renderQuestionContent = () => {
    switch (currentQuestionIndex) {
      case 0:
      case 1:
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
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '1.2rem'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'white'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white'
                  }
                }
              }}
            />
          </motion.div>
        );
      case 2:
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
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: 2 
              }}
            >
              {domains.map((domain) => (
                <motion.div
                  key={domain}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={formData.domain === domain ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => handleDomainSelect(domain)}
                    sx={{
                      borderRadius: 4,
                      px: 3,
                      py: 1.5,
                      backgroundColor: formData.domain === domain 
                        ? 'primary.main' 
                        : 'transparent',
                      color: formData.domain === domain 
                        ? 'white' 
                        : 'primary.light',
                      borderColor: 'primary.light',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        color: 'white'
                      }
                    }}
                  >
                    {domain}
                  </Button>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Video Background */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.6)', // Darkish overlay
              zIndex: 1
            }
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          >
            <source src="/vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}

      {/* Content Box */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          backgroundColor: 'rgba(0,0,0,0.4)' // Additional background darkness
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 4, 
                textAlign: 'center', 
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {displayedText}
            </Typography>
          </motion.div>
        </AnimatePresence>

        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <AnimatePresence mode="wait">
            {renderQuestionContent()}
          </AnimatePresence>
        </Box>

        {currentQuestionIndex === 2 && formData.domain && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinalSubmit}
              sx={{
                mt: 3,
                px: 4,
                py: 1.5,
                borderRadius: 4,
                fontSize: '1.1rem'
              }}
            >
              Continue
            </Button>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default Ques;
