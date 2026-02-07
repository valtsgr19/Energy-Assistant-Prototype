import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Paper, Divider } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  example: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(3, 0)
  },
  fontWeightExample: {
    marginBottom: theme.spacing(2)
  }
}));

const TypographyPage: React.FC = () => {
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Typography
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        The Kaluza typography system uses Azo Sans Web with a modular scale.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Headings
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="h1" gutterBottom>
            Heading 1 - 2rem (32px)
          </Typography>
          <Typography variant="h2" gutterBottom>
            Heading 2 - 1.8125rem (29px)
          </Typography>
          <Typography variant="h3" gutterBottom>
            Heading 3 - 1.5625rem (25px)
          </Typography>
          <Typography variant="h4" gutterBottom>
            Heading 4 - 1.375rem (22px)
          </Typography>
          <Typography variant="h5" gutterBottom>
            Heading 5 - 1.25rem (20px)
          </Typography>
          <Typography variant="h6">
            Heading 6 - 1.125rem (18px)
          </Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Body Text
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="body1" paragraph>
            Body 1 - 1rem (16px) - This is the default body text size. It's optimized for readability
            across all devices and screen sizes. Use this for most content.
          </Typography>
          <Typography variant="body2" paragraph>
            Body 2 - 1rem (16px) - Alternative body text style with different styling.
            Can be used for secondary content or variations.
          </Typography>
          <Typography variant="subtitle1" paragraph>
            Subtitle 1 - 0.875rem (14px) - Used for subtitles and secondary headings.
          </Typography>
          <Typography variant="subtitle2">
            Subtitle 2 - 0.75rem (12px) - Smaller subtitle for captions and labels.
          </Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Font Weights
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="h6" style={{ fontWeight: 300 }} className={classes.fontWeightExample}>
            Light (300) - Elegant and refined
          </Typography>
          <Typography variant="h6" style={{ fontWeight: 400 }} className={classes.fontWeightExample}>
            Regular (400) - Default weight for body text
          </Typography>
          <Typography variant="h6" style={{ fontWeight: 500 }} className={classes.fontWeightExample}>
            Medium (500) - Headings and emphasis
          </Typography>
          <Typography variant="h6" style={{ fontWeight: 700 }}>
            Bold (700) - Strong emphasis
          </Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Text Colors
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="body1" color="textPrimary" paragraph>
            Primary text color - #10100F (Black)
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Secondary text color - #BE8A75 (Wafer 500)
          </Typography>
          <Typography variant="body1" color="primary" paragraph>
            Primary brand color - #5A7554 (Envy 500)
          </Typography>
          <Typography variant="body1" color="secondary" paragraph>
            Secondary brand color - #BE8A75 (Wafer 500)
          </Typography>
          <Typography variant="body1" color="error" paragraph>
            Error color - #FF4E4E (Cherry)
          </Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Text Alignment
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="body1" align="left" paragraph>
            Left aligned text (default)
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Center aligned text
          </Typography>
          <Typography variant="body1" align="right" paragraph>
            Right aligned text
          </Typography>
          <Typography variant="body1" align="justify">
            Justified text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Text Transform
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="body1" style={{ textTransform: 'uppercase' }} paragraph>
            Uppercase text
          </Typography>
          <Typography variant="body1" style={{ textTransform: 'lowercase' }} paragraph>
            LOWERCASE TEXT
          </Typography>
          <Typography variant="body1" style={{ textTransform: 'capitalize' }}>
            capitalize each word
          </Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Usage Guidelines
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="h6" gutterBottom>
            Best Practices
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" paragraph>
                Use H1 for page titles (one per page)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Maintain proper heading hierarchy (H1 → H2 → H3)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Use body1 for main content, body2 for secondary content
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Keep line length between 50-75 characters for readability
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Use appropriate font weights for emphasis (avoid overusing bold)
              </Typography>
            </li>
          </ul>
        </Paper>
      </div>
    </div>
  );
};

export default TypographyPage;
