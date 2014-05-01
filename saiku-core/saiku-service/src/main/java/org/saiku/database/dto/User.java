package org.saiku.database.dto;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToOne;
import javax.persistence.Table;

/**
 * Created by bugg on 01/05/14.
 */
@Entity
@Table(name="USERS")
public class User {

  @Id
  @GeneratedValue
  private Integer id;

  private String user;

  private String password;

  @OneToOne(cascade= CascadeType.ALL)
  @JoinTable(name="USER_ROLES",
    joinColumns = {@JoinColumn(name="USER_ID", referencedColumnName="id")},
    inverseJoinColumns = {@JoinColumn(name="USER_ROLE_ID", referencedColumnName="id")}
  )
  private Role role;

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getUser() {
    return user;
  }

  public void setUser( String user ) {
    this.user = user;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

}
