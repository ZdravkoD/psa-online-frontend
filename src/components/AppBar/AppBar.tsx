import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

export default function MyAppBar() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const list = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem button onClick={() => handleNavigation('/')}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation('/start-task')}>
                    <ListItemIcon>
                        <AddCircleOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Нова поръчка" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation('/tasks-history')}>
                    <ListItemIcon>
                        <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="История" />
                </ListItem>
                <ListItem button onClick={() => handleNavigation('/product-names')}>
                    <ListItemIcon>
                        <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Имена на продукти" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }} style={{paddingBottom: 14}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: "pointer" }}
                        onClick={(event) => {
                            if (event.metaKey) {
                                window.open('/', '_blank');
                            } else {
                                handleNavigation('/');
                            }
                        }}
                    >
                        Pharmacy Stock Automation
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                sx={{
                    '.MuiDrawer-paper': { top: 64 } // Adjust this value if your AppBar is a different height
                }}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                    BackdropProps: {
                        invisible: true
                    }
                }}
            >
                {list()}
            </Drawer>
        </Box>
    );
}
