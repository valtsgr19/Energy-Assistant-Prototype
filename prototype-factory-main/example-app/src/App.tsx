import React, { useState } from 'react';
import { ThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Container,
  useMediaQuery
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

// Pages
import HomePage from './pages/HomePage';
import ColorsPage from './pages/ColorsPage';
import TypographyPage from './pages/TypographyPage';
import ButtonsPage from './pages/ButtonsPage';
import FormsPage from './pages/FormsPage';
import CardsPage from './pages/CardsPage';
import TablesPage from './pages/TablesPage';
import FeedbackPage from './pages/FeedbackPage';
import NavigationPage from './pages/NavigationPage';
import LayoutPage from './pages/LayoutPage';

// Theme configuration
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#E5EAE1',
      main: '#5A7554',
      dark: '#2C3B2A'
    },
    secondary: {
      light: '#F6EDEA',
      main: '#BE8A75',
      dark: '#754F3F'
    },
    error: {
      main: '#FF4E4E'
    },
    success: {
      main: '#4FD061'
    },
    warning: {
      main: '#FFEA4F'
    },
    info: {
      main: '#58D5F8'
    },
    text: {
      primary: '#10100F',
      secondary: '#BE8A75'
    },
    background: {
      default: '#FFFFFF',
      paper: '#F4F6F3'
    }
  },
  typography: {
    fontFamily: ['Aspekta', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.8125rem', fontWeight: 600 },
    h3: { fontSize: '1.5625rem', fontWeight: 500 },
    h4: { fontSize: '1.375rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1.125rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '1rem', fontWeight: 400 }
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 768,
      lg: 1280,
      xl: 1920
    }
  }
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default
  },
  appBar: {
    backgroundColor: theme.palette.primary.main
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    fontWeight: 500
  },
  drawer: {
    width: 280
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: '#FFFFFF'
  },
  drawerList: {
    width: 280
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2)
    }
  },
  activeMenuItem: {
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.light
    }
  }
}));

const menuItems = [
  { id: 'home', label: 'Home', component: HomePage },
  { id: 'colors', label: 'Colors', component: ColorsPage },
  { id: 'typography', label: 'Typography', component: TypographyPage },
  { id: 'buttons', label: 'Buttons', component: ButtonsPage },
  { id: 'forms', label: 'Forms', component: FormsPage },
  { id: 'cards', label: 'Cards', component: CardsPage },
  { id: 'tables', label: 'Tables', component: TablesPage },
  { id: 'feedback', label: 'Feedback', component: FeedbackPage },
  { id: 'navigation', label: 'Navigation', component: NavigationPage },
  { id: 'layout', label: 'Layout', component: LayoutPage }
];

function App() {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuClick = (pageId: string) => {
    setActivePage(pageId);
    setDrawerOpen(false);
  };

  const ActiveComponent = menuItems.find(item => item.id === activePage)?.component || HomePage;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Kaluza Component Showcase
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <div className={classes.drawerHeader}>
            <Typography variant="h6">Menu</Typography>
            <IconButton color="inherit" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <List className={classes.drawerList}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={activePage === item.id ? classes.activeMenuItem : ''}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <main className={classes.content}>
          <Container maxWidth="lg">
            <ActiveComponent />
          </Container>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
