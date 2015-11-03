package org.saiku.license;

/**
 * Created by bugg on 03/10/15.
 */
public class UserQuota {

  private String user;
  private int remainingLogins;

  public UserQuota() {
  }
  public UserQuota(String user, int remainingLogins) {
    this.user = user;
    this.remainingLogins = remainingLogins;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public int getRemainingLogins() {
    return remainingLogins;
  }

  public void setRemainingLogins(int remainingLogins) {
    this.remainingLogins = remainingLogins;
  }
}
