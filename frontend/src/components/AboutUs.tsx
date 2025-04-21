import { 
    Container, 
    Typography, 
    Box, 
    Grid, 
    Avatar, 
    Paper,
    useTheme,
    useMediaQuery, 
  } from "@mui/material";
  import { 
    AttachMoney, 
    ShowChart,  
    Code,
    PieChart
  } from "@mui/icons-material";
  
  export default function AboutUs() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
    const features = [
      {
        icon: <AttachMoney fontSize="large" />,
        title: "Expense Tracking",
        description: "Monitor every transaction with detailed categorization and real-time updates."
      },
      {
        icon: <ShowChart fontSize="large" />,
        title: "Income Management",
        description: "Track all income sources and visualize your earnings growth over time."
      },
      {
        icon: <PieChart fontSize="large" color="primary" />,
        title: "Smart Budgeting & Insights",
        description:
          "Get a real-time overview of your spending with interactive budget summaries and visual charts. Our dashboard uses color-coded indicators to highlight over/under spending, while charts like pie, bar, line, and radar help you analyze trends and optimize your finances effortlessly."
      },      
    //   {
    //     icon: <Code fontSize="large" />,
    //     title: "Modern Technology",
    //     description: "Built with React, Material UI, and Django REST for reliability and performance."
    //   }
    ];
  
    return (
      <Container maxWidth="lg" sx={{ 
        mt: 8,
        mb: 8,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}>
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
              mb: 2
            }}
          >
            About Our Financial Platform
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            maxWidth="md" 
            mx="auto"
            sx={{ opacity: 0.9 }}
          >
            Your comprehensive solution for intelligent financial management and wealth building
          </Typography>
        </Box>
  
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 6,
            borderRadius: 3,
            background: theme.palette.mode === 'dark' 
              ? theme.palette.grey[900] 
              : theme.palette.grey[50],
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary
                }}
              >
                Our Mission
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                We're dedicated to democratizing financial intelligence by providing 
                powerful yet accessible tools that help individuals take control of 
                their financial future.
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                Built with React, Material UI, and Django REST, our platform combines 
                cutting-edge technology with financial expertise to deliver a seamless 
                user experience.
              </Typography>
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 300,
                  backgroundImage: theme.palette.mode === 'dark'
                    ? 'linear-gradient(to right, #0f2027, #203a43, #2c5364)'
                    : 'linear-gradient(to right, #e0f7fa, #b2ebf2, #80deea)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <People sx={{ fontSize: 120, color: theme.palette.primary.main }} />
              </Box>
            </Grid> */}
          </Grid>
        </Paper>
  
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Key Features
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  },
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mb: 2,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? theme.palette.primary.dark
                        : theme.palette.primary.light,
                      color: theme.palette.primary.contrastText
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ flexGrow: 1 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
  
        <Box 
          sx={{ 
            mt: 8,
            textAlign: 'center',
            px: isMobile ? 2 : 8
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 500,
              color: theme.palette.text.secondary
            }}
          >
            Join thousands of users who have transformed their financial lives
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontStyle: 'italic',
              mt: 2
            }}
          >
            "The best investment you can make is in your own financial education."
          </Typography>
        </Box>
      </Container>
    );
  }