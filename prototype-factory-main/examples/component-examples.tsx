/**
 * Ready-to-use Component Examples
 * 
 * Copy and adapt these components for your prototype.
 * All components follow Kaluza design patterns.
 */

import React, { useState, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button as MuiButton,
  Card as MuiCard,
  CardContent,
  CardActions,
  TextField,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Container,
  Grid,
  Paper,
  Chip,
  Alert
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

const useButtonStyles = makeStyles((theme) => ({
  contained: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    textTransform: 'uppercase',
    fontWeight: 'initial',
    borderRadius: '2rem',
    letterSpacing: '.09rem',
    backgroundColor: theme.palette.primary.main,
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  },
  outlined: {
    background: 'transparent',
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.text.primary,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    textTransform: 'uppercase',
    fontWeight: 'initial',
    borderRadius: '2rem',
    letterSpacing: '.09rem'
  }
}));

export const Button: React.FC<{
  variant?: 'contained' | 'outlined';
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}> = ({ variant = 'contained', onClick, children, disabled }) => {
  const classes = useButtonStyles();
  
  return (
    <MuiButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={variant === 'contained' ? classes.contained : classes.outlined}
    >
      {children}
    </MuiButton>
  );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

const useCardStyles = makeStyles((theme) => ({
  card: {
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF'
  },
  header: {
    padding: theme.spacing(2),
    borderBottom: '1px solid #E5EAE1'
  },
  content: {
    padding: theme.spacing(2)
  },
  actions: {
    padding: theme.spacing(2),
    justifyContent: 'flex-end'
  }
}));

export const Card: React.FC<{
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}> = ({ title, children, actions }) => {
  const classes = useCardStyles();
  
  return (
    <MuiCard className={classes.card}>
      {title && (
        <div className={classes.header}>
          <Typography variant="h6">{title}</Typography>
        </div>
      )}
      <CardContent className={classes.content}>
        {children}
      </CardContent>
      {actions && (
        <CardActions className={classes.actions}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

// ============================================================================
// FORM COMPONENT
// ============================================================================

const useFormStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
  },
  input: {
    '& .MuiFilledInput-root': {
      backgroundColor: '#E5EAE1',
      '&:hover': {
        backgroundColor: '#CAD4C6'
      },
      '&.Mui-focused': {
        backgroundColor: '#E5EAE1'
      }
    }
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2)
  }
}));

export const Form: React.FC<{
  onSubmit: (data: Record<string, string>) => void;
  onCancel?: () => void;
}> = ({ onSubmit, onCancel }) => {
  const classes = useFormStyles();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <TextField
        label="Name"
        variant="filled"
        value={formData.name}
        onChange={handleChange('name')}
        className={classes.input}
        required
      />
      <TextField
        label="Email"
        type="email"
        variant="filled"
        value={formData.email}
        onChange={handleChange('email')}
        className={classes.input}
        required
      />
      <TextField
        label="Message"
        variant="filled"
        multiline
        rows={4}
        value={formData.message}
        onChange={handleChange('message')}
        className={classes.input}
        required
      />
      <div className={classes.buttonGroup}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" onClick={() => {}}>
          Submit
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

const useHeaderStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#5A7554'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  logo: {
    fontWeight: 500,
    fontSize: '1.25rem',
    color: '#FFFFFF'
  },
  menuButton: {
    color: '#FFFFFF'
  }
}));

export const Header: React.FC<{
  title: string;
  onMenuClick?: () => void;
}> = ({ title, onMenuClick }) => {
  const classes = useHeaderStyles();
  
  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.logo}>
          {title}
        </Typography>
        {onMenuClick && (
          <IconButton
            edge="end"
            className={classes.menuButton}
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

const useSidebarStyles = makeStyles((theme) => ({
  drawer: {
    width: 280
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottom: '1px solid #E5EAE1'
  },
  list: {
    padding: theme.spacing(2)
  }
}));

export const Sidebar: React.FC<{
  open: boolean;
  onClose: () => void;
  items: Array<{ label: string; onClick: () => void }>;
}> = ({ open, onClose, items }) => {
  const classes = useSidebarStyles();
  
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <div className={classes.drawer}>
        <div className={classes.header}>
          <Typography variant="h6">Menu</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <List className={classes.list}>
          {items.map((item, index) => (
            <ListItem button key={index} onClick={item.onClick}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
};

// ============================================================================
// DASHBOARD LAYOUT
// ============================================================================

const useDashboardStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: '#F4F6F3'
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  pageTitle: {
    marginBottom: theme.spacing(3),
    fontWeight: 500
  },
  grid: {
    marginBottom: theme.spacing(3)
  }
}));

export const DashboardLayout: React.FC<{
  title: string;
  children: ReactNode;
}> = ({ title, children }) => {
  const classes = useDashboardStyles();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', onClick: () => console.log('Dashboard') },
    { label: 'Analytics', onClick: () => console.log('Analytics') },
    { label: 'Settings', onClick: () => console.log('Settings') }
  ];

  return (
    <div className={classes.root}>
      <Header title="Kaluza" onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={menuItems}
      />
      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h4" className={classes.pageTitle}>
          {title}
        </Typography>
        {children}
      </Container>
    </div>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const useStatCardStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(3),
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  value: {
    fontSize: '2rem',
    fontWeight: 500,
    color: '#5A7554',
    marginBottom: theme.spacing(1)
  },
  label: {
    fontSize: '0.875rem',
    color: '#BE8A75',
    textTransform: 'uppercase'
  }
}));

export const StatCard: React.FC<{
  value: string | number;
  label: string;
}> = ({ value, label }) => {
  const classes = useStatCardStyles();
  
  return (
    <Paper className={classes.card}>
      <Typography className={classes.value}>{value}</Typography>
      <Typography className={classes.label}>{label}</Typography>
    </Paper>
  );
};

// ============================================================================
// ALERT COMPONENT
// ============================================================================

export const AlertMessage: React.FC<{
  severity: 'error' | 'warning' | 'info' | 'success';
  message: string;
  onClose?: () => void;
}> = ({ severity, message, onClose }) => {
  return (
    <Alert severity={severity} onClose={onClose}>
      {message}
    </Alert>
  );
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

export const ExampleApp: React.FC = () => {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <DashboardLayout title="Dashboard Overview">
      {showAlert && (
        <AlertMessage
          severity="success"
          message="Welcome to your dashboard!"
          onClose={() => setShowAlert(false)}
        />
      )}
      
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value="1,234" label="Total Users" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value="567" label="Active Sessions" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value="89%" label="Success Rate" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value="$12.5K" label="Revenue" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card title="Recent Activity">
            <Typography>Your recent activity will appear here.</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            title="Quick Actions"
            actions={
              <>
                <Button variant="outlined">View All</Button>
                <Button variant="contained">Add New</Button>
              </>
            }
          >
            <Typography>Manage your quick actions.</Typography>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};
