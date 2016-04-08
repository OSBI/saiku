package bi.meteorite.license;

import java.util.Date;

/**
 * Created by bugg on 18/03/14.
 */
public class SaikuLicense2 extends AbstractLicense {

  private int memoryLimit;
  private String hostname;

  public int getUserLimit() {
    return userLimit;
  }

  public void setUserLimit(int userLimit) {
    this.userLimit = userLimit;
  }

  private int userLimit;

  public int getMemoryLimit() {
    return memoryLimit;
  }

  public void setMemoryLimit(int memoryLimit) {
    this.memoryLimit = memoryLimit;
  }


  public void validateMemory(int mem) throws LicenseException {

  }

  public void validateHostname(String hostname) throws LicenseException {

  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  public String getHostname() {
    return hostname;
  }

  @Override
  public void validate(Date currentDate, String currentVersion)
      throws LicenseException {

    v(currentDate, currentVersion);


  }

  private void v(Date currentDate, String currentVersion) throws LicenseException{

    if(!currentVersion.substring(0,1).equals(this.getVersion())){
      throw new LicenseVersionExpiredException();
    }
  }
}
