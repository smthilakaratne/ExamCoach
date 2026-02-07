import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          ExamCoach
        </Typography>
        <Button color="inherit" component={Link} to="/syllabus">Syllabus</Button>
        <Button color="inherit" component={Link} to="/progress">Progress</Button>
        <Button color="inherit" component={Link} to="/mock-exam">Mock Exam</Button>
        <Button color="inherit" component={Link} to="/forum">Forum</Button>
        <Button color="inherit" component={Link} to="/profile">Profile</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
