import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Chip, 
  Grid,
  Button,
  Divider,
  useMediaQuery, 
  useTheme
} from "@mui/material";
import { motion } from 'framer-motion';
import { 
  Dashboard as DashboardIcon, 
  Business as BusinessIcon, 
  Work as WorkIcon, 
  People as PeopleIcon 
} from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
import supabase from './supabaseClient';

const CompanyDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const data = location.state;
      
      if (data) {
        setCompanyData(data);
      } else {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            navigate('/company-registration');
            return;
          }

          const { data: companies, error } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;

          setCompanyData(companies);
        } catch (error) {
          console.error('Error fetching company data:', error);
          navigate('/company-registration');
        }
      }
    };

    fetchCompanyData();
  }, [location.state, navigate]);

  if (!companyData) {
    return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</Box>;
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh', 
        background: '#f4f6f9',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Page Header */}
      <Box 
        sx={{
          backgroundColor: '#ffffff',
          py: 3,
          px: 4,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon sx={{ color: '#2c3e50', fontSize: 32 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#2c3e50', 
              fontWeight: 600,
              letterSpacing: 1
            }}
          >
            Company Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {/* Company Overview Card */}
            <Grid item xs={12} md={8}>
              <Card 
                sx={{ 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                  borderRadius: 2 
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BusinessIcon sx={{ mr: 2, color: '#2c3e50' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {companyData.companyName}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Tech Domain
                      </Typography>
                      <Chip 
                        label={companyData.techDomain} 
                        color="primary" 
                        sx={{ 
                          fontSize: '1rem', 
                          fontWeight: 500,
                          px: 1 
                        }} 
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Required Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {companyData.requiredSkills.map((skill) => (
                          <Chip 
                            key={skill} 
                            label={skill} 
                            variant="outlined" 
                            size="small"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions Card */}
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                  borderRadius: 2,
                  height: '100%' 
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PeopleIcon />}
                      sx={{ 
                        backgroundColor: '#2c3e50',
                        '&:hover': { backgroundColor: '#34495e' }
                      }}
                    >
                      Hire Candidates
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<WorkIcon />}
                      sx={{ 
                        borderColor: '#2c3e50',
                        color: '#2c3e50',
                        '&:hover': { 
                          backgroundColor: 'rgba(44,62,80,0.1)',
                          borderColor: '#2c3e50' 
                        }
                      }}
                    >
                      Job Postings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CompanyDashboard;