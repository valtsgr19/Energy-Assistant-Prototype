import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Grid,
  Avatar
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  media: {
    height: 140,
    backgroundColor: theme.palette.primary.light
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    width: 56,
    height: 56
  }
}));

const CardsPage: React.FC = () => {
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Cards
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Cards contain content and actions about a single subject.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Basic Cards
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Simple Card
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  This is a basic card with just content. Cards can contain text, images, and actions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Card with Actions
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Cards can include action buttons at the bottom.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
                <Button size="small" color="primary">
                  Share
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.card}>
              <CardMedia
                className={classes.media}
                title="Card media"
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Media Card
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Cards can include images or other media at the top.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Profile Cards
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Avatar className={classes.avatar} style={{ margin: '0 auto 16px' }}>
                  JD
                </Avatar>
                <Typography variant="h6">
                  John Doe
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Software Engineer
                </Typography>
                <Typography variant="body2">
                  Building amazing products with React and TypeScript.
                </Typography>
              </CardContent>
              <CardActions style={{ justifyContent: 'center' }}>
                <Button size="small" color="primary">
                  View Profile
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Stat Cards
        </Typography>
        <Grid container spacing={3}>
          {[
            { label: 'Total Users', value: '1,234' },
            { label: 'Active Sessions', value: '567' },
            { label: 'Revenue', value: '$12.5K' },
            { label: 'Growth', value: '+23%' }
          ].map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper style={{ padding: 24, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default CardsPage;
