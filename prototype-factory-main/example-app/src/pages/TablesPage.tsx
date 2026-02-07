import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  }
}));

const TablesPage: React.FC = () => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const rows = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
    { id: 6, name: 'Diana Davis', email: 'diana@example.com', role: 'Admin', status: 'Active' },
    { id: 7, name: 'Eve Martinez', email: 'eve@example.com', role: 'User', status: 'Inactive' }
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tables
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Tables display sets of data in rows and columns.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Basic Table
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={row.status === 'Active' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Dense Table
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>001</TableCell>
                <TableCell>Product A</TableCell>
                <TableCell align="right">$29.99</TableCell>
                <TableCell align="right">150</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>002</TableCell>
                <TableCell>Product B</TableCell>
                <TableCell align="right">$49.99</TableCell>
                <TableCell align="right">75</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>003</TableCell>
                <TableCell>Product C</TableCell>
                <TableCell align="right">$19.99</TableCell>
                <TableCell align="right">200</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default TablesPage;
