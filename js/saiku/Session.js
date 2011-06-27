/**
 * Object which handles authentication
 * @param username
 * @param password
 * @returns {Session}
 */
function Session(username, password) {
    this.username = username ? username : "";
    this.password = password ? password : "";
}