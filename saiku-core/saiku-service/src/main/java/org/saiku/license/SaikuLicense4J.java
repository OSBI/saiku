package org.saiku.license;

import bi.meteorite.license.LicenseExpiredException;
import bi.meteorite.license.SaikuLicense2;
import com.license4j.ActivationStatus;
import com.license4j.License;
import com.license4j.LicenseText;
import com.license4j.ValidationStatus;

import java.util.Date;

public class SaikuLicense4J extends SaikuLicense2 implements java.io.Serializable {
  // set a fixed serialVersionUID to avoid serialization incompatibilities through different compilations
  private static final long serialVersionUID = 2806421523585360625L;

  private String key;

  private transient String activationString;
  private transient License activatedLicense;
  private transient LicenseText licenseText;

  public SaikuLicense4J(String key) {
    super();

    this.key = key;

    this.fetchActivationStatus();
    this.initLicenseFields();
  }

  private void fetchActivationStatus() {
    if (!isActivated()) {
      activationString = License4JUtils.activate(key);
      activatedLicense = License4JUtils.fetchActivatedLicense(activationString);
      licenseText = activatedLicense.getLicenseText();
    }
  }

  private boolean isActivated() {
    if (this.licenseText == null || activatedLicense == null || licenseText == null) {
      return false;
    }

    if (activatedLicense.getValidationStatus() == ValidationStatus.LICENSE_VALID &&
        activatedLicense.getActivationStatus() == ActivationStatus.ACTIVATION_COMPLETED) {
      return true;
    }

    return false;
  }

  private void initLicenseFields() {
    if (licenseText == null) {
      return;
    }

    this.setMemoryLimit(Integer.MAX_VALUE);
    this.setUserLimit(Integer.MAX_VALUE);
    this.setName(licenseText.getUserRegisteredTo());
    this.setEmail(licenseText.getUserEMail());
    this.setLicenseType(AbstractLicense.TYPE_FULL);
    this.setExpiration(licenseText.getLicenseExpireDate());
    this.setLicenseNumber(Long.toString(licenseText.getLicenseID()));
  }

  @Override
  public void validateHostname(String hostname) {
  }

  @Override
  public void validateMemory(int mem) {
  }

  @Override
  public void validateExpiration(Date currentDate) {
  }

  @Override
  public void validateVersion(String currentVersion) {
  }

  @Override
  public void validate(Date currentDate, String currentVersion, boolean hostname, boolean ram, boolean version,
                       boolean expiration) throws bi.meteorite.license.LicenseException {

    this.fetchActivationStatus();
    this.initLicenseFields();

    if (activatedLicense == null) {
      throw new bi.meteorite.license.LicenseException("Invalid license");
    }

    validateLicenseStatus();
    validateActivationStatus();
  }

  private void validateLicenseStatus() throws bi.meteorite.license.LicenseException {
    if (activatedLicense.getValidationStatus() != ValidationStatus.LICENSE_VALID) {
      switch (activatedLicense.getValidationStatus()) {
        case LICENSE_INVALID:
          throw new bi.meteorite.license.LicenseException("Invalid license");
        case LICENSE_EXPIRED:
          throw new LicenseExpiredException();
        case LICENSE_MAINTENANCE_EXPIRED:
          throw new bi.meteorite.license.LicenseException("Maintenance period has expired");
        case MISMATCH_PRODUCT_ID:
          throw new bi.meteorite.license.LicenseException("Wrong product ID");
        case MISMATCH_PRODUCT_EDITION:
          throw new bi.meteorite.license.LicenseException("Wrong product edition");
        case MISMATCH_PRODUCT_VERSION:
          throw new bi.meteorite.license.LicenseException("Wrong product version");
        case MISMATCH_HARDWARE_ID:
          throw new bi.meteorite.license.LicenseException("Wrong hardware ID");
        case FLOATING_LICENSE_SERVER_NOT_AVAILABLE:
          throw new bi.meteorite.license.LicenseException("Floating server not available");
        case FLOATING_LICENSE_CLIENT_REJECTED:
          throw new bi.meteorite.license.LicenseException("Floating license client rejected");
        case FLOATING_LICENSE_NOT_FOUND:
          throw new bi.meteorite.license.LicenseException("Floating license not found");
        case FLOATING_LICENSE_NOT_AVAILABLE_ALL_IN_USE:
          throw new bi.meteorite.license.LicenseException("Floating license not available");
        case FLOATING_LICENSE_ALLOWED_USE_COUNT_REACHED:
          throw new bi.meteorite.license.LicenseException("Floating license allowed use count reached");
        case FLOATING_LICENSE_ALLOWED_USE_TIME_REACHED:
          throw new bi.meteorite.license.LicenseException("Floating license allowed use time reached");
        case FLOATING_LICENSE_OVERUSED:
          throw new bi.meteorite.license.LicenseException("Floating license overused");
        case INCORRECT_SYSTEM_TIME:
          throw new bi.meteorite.license.LicenseException("Wrong system time");
        case VALIDATION_REJECTED_IP_BLOCK_RESTRICTION:
          throw new bi.meteorite.license.LicenseException("Invalid IP block restriction");
        case VALIDATION_REJECTED_FEATURE_DISABLED:
          throw new bi.meteorite.license.LicenseException("Rejected feature disabled");
      }
    }
  }

  private void validateActivationStatus() throws bi.meteorite.license.LicenseException {
    if (activatedLicense.getActivationStatus() != ActivationStatus.ACTIVATION_COMPLETED) {
      switch (activatedLicense.getActivationStatus()) {
        case ACTIVATION_SERVER_CONNECTION_ERROR:
          throw new bi.meteorite.license.LicenseException("Activation error: server connection error");
        case LICENSE_NOT_FOUND_ON_ACTIVATION_SERVER:
          throw new bi.meteorite.license.LicenseException("Activation error: license not found on activation server");
        case ALREADY_ACTIVATED_ON_ANOTHER_COMPUTER:
          throw new bi.meteorite.license.LicenseException("Activation error: already activated on another computer");
        case MULTIPLE_ACTIVATION_LIMIT_REACHED:
          throw new bi.meteorite.license.LicenseException("Activation error: activation limit reached");
        case ACTIVATION_REQUIRED:
          throw new bi.meteorite.license.LicenseException("Activation error: activation required");
        case ACTIVATION_HARDWAREID_ERROR:
          throw new bi.meteorite.license.LicenseException("Activation error: hardware ID error");
        case ACTIVATION_REJECTED_IP_BLOCK_RESTRICTION:
          throw new bi.meteorite.license.LicenseException("Activation error: rejected IP block restriction");
        case ACTIVATION_REJECTED_FEATURE_DISABLED:
          throw new bi.meteorite.license.LicenseException("Activation error: rejected feature disabled");
        case ACTIVATION_NOT_FOUND_ON_SERVER:
          throw new bi.meteorite.license.LicenseException("Activation error: activation not found on server");
        case DEACTIVATION_REJECTED_FEATURE_DISABLED:
          throw new bi.meteorite.license.LicenseException("Activation error: deactivation rejected feature disabled");
        case MULTIPLE_DEACTIVATION_LIMIT_REACHED:
          throw new bi.meteorite.license.LicenseException("Activation error: multiple deactivation limit reached");
      }
    }
  }
}
