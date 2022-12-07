# Alohabnb - CS 6314 Final Project
## Progress
- Moved the css file and html template into Express framework (views/layout.jade)
- Added index, login, and register pages
- Check and hash password (password for the existing users are all "Aa1234")
- Keep signed in until logged out
- Create user home page
- Check if we should use uid or _id
- Added json files for mongodb (./util)
## TODO
### Login & Register
- Remove uid, pid, rid, use _id instead
- Add more links to the profile page
- Need to dynamically load the nav bar based on the logged status (for '/')
### Properties
- Load properties from mongodb and add hw2 features (filtering and getting individual property details)
- Ratings/Comments
- Host account
### Reservation
- Check if available
- Cancel
