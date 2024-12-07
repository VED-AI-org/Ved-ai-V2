import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  useMediaQuery, 
  useTheme, 
  Container,
  Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from './supabaseClient';

const CompanyReg = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const questions = [
    "What's your company name?",
    "Select your company's primary tech domain",
    "Select skill sets required for your team"
  ];

  const techDomains = [
    "Web Development", "Mobile Development", "Cloud Computing", 
    "AI/Machine Learning", "Cybersecurity", "Data Science"
  ];

  const skillSets = [
    "React", "Node.js", "Python", "Java", "JavaScript", 
    "TypeScript", "AWS", "Docker", "Kubernetes", 
    "Machine Learning", "SQL", "MongoDB"
  ];

  const [displayedText, setDisplayedText] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    techDomain: "",
    requiredSkills: []
  });
  const [introCompleted, setIntroCompleted] = useState(false);
  const [selectedTechDomain, setSelectedTechDomain] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!introCompleted) {
      typeWriter("Let's set up your company profile", () => {
        setTimeout(() => setIntroCompleted(true), 1000);
      });
    } else if (questions[currentQuestionIndex]) {
      typeWriter(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, introCompleted, typeWriter]);

  const handleSubmit = () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) return;

    if (currentQuestionIndex === 0) {
      if (trimmedAnswer.length < 2) {
        alert("Please enter a valid company name");
        return;
      }
      setFormData(prev => ({ ...prev, companyName: trimmedAnswer }));
    }

    setAnswer("");
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleTechDomainSelect = (domain) => {
    setSelectedTechDomain(domain);
    setFormData(prev => ({ ...prev, techDomain: domain }));
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const proceedToNextStep = async () => {
    if (selectedSkills.length === 0) {
      alert("Please select at least one skill set");
      return;
    }

    const finalFormData = {
      ...formData,
      requiredSkills: selectedSkills
    };

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
      .from('companies')
      .insert({
        company_name: finalFormData.companyName,
        tech_domain: finalFormData.techDomain,
        required_skills: finalFormData.requiredSkills
      })
      .select();

      if (error) throw error;
      
      // Redirect to dashboard immediately after successful submission
      navigate("/company-dashboard", {
        state: {
          companyName: finalFormData.companyName,
          techDomain: finalFormData.techDomain,
          requiredSkills: finalFormData.requiredSkills
        },
        replace: true,
      });
    } catch (error) {
      console.error('Error during submission:', error);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionContent = () => {
    if (currentQuestionIndex === 1) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
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
            }}
          >
            {techDomains.map((domain) => (
              <Button
                key={domain}
                variant={selectedTechDomain === domain ? "contained" : "outlined"}
                onClick={() => handleTechDomainSelect(domain)}
                sx={{
                  borderRadius: 6,
                  px: 4,
                  py: 2,
                  fontSize: isMobile ? "1rem" : "1.3rem",
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white"
                  },
                  ...(selectedTechDomain === domain ? {} : {
                    border: "1px solid white",
                    color: "white"
                  })
                }}
              >
                {domain}
              </Button>
            ))}
          </Box>
        </motion.div>
      );
    }

    if (currentQuestionIndex === 2) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
              mt: 6,
              mb: 6,
            }}
          >
            {skillSets.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onClick={() => handleSkillSelect(skill)}
                color={selectedSkills.includes(skill) ? "primary" : "default"}
                variant={selectedSkills.includes(skill) ? "filled" : "outlined"}
                sx={{
                  margin: '0.5rem',
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                  color: "white",
                  borderColor: "white",
                  ...(selectedSkills.includes(skill) ? {} : {
                    border: "1px solid white",
                    color: "white"
                  })
                }}
              />
            ))}
          </Box>
          {selectedSkills.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={proceedToNextStep}
              disabled={submitting}
              sx={{
                borderRadius: 6,
                px: 8,
                py: 2,
                fontSize: isMobile ? "1.2rem" : "1.5rem",
                color: "white",
                borderColor: "white"
              }}
            >
              {submitting ? "Saving..." : "Complete Registration"}
            </Button>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label={questions[currentQuestionIndex]}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          InputLabelProps={{
            style: { color: 'white' }
          }}
          sx={{
            "& .MuiInputBase-input": {
              color: "white",
              fontSize: isMobile ? "1.3rem" : "1.6rem",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "white"
              },
              "&:hover fieldset": {
                borderColor: "white"
              },
              "&.Mui-focused fieldset": {
                borderColor: "white"
              }
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            mt: 4,
            borderRadius: 6,
            px: 8,
            py: 2,
            fontSize: isMobile ? "1.2rem" : "1.5rem",
            color: "white",
            borderColor: "white"
          }}
        >
          Next
        </Button>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/quess.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <Container 
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {!introCompleted ? (
            <Typography
              variant="h2"
              sx={{
                color: "white",
                fontSize: isMobile ? "2.5rem" : "4rem",
              }}
            >
              {displayedText}
            </Typography>
          ) : (
            <>
              <Typography
                variant="h4"
                sx={{
                  mb: 6,
                  color: "white",
                  fontSize: isMobile ? "1.8rem" : "2.5rem",
                }}
              >
                {displayedText}
              </Typography>
              {renderQuestionContent()}
            </>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default CompanyReg;