package org.saiku.license;

import bi.meteorite.license.LicenseExpiredException;
import bi.meteorite.license.SaikuLicense2;
import com.license4j.*;
import org.saiku.service.license.Base64Coder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.Date;

public class License4JUtils {
  private static final String publickey =
      "30819f300d06092a864886f70d010101050003818d003081893032301006072a8648ce3d02" +
      "002EC311215SHA512withECDSA106052b81040006031e00049077fc92a1886f3d23c5f59e7" +
      "cda35ee5b76a5378b5c5813e73cb3daG0281810086c13e94c6e8151dd1773e6efcf0620a4f" +
      "5707662e3e6d02d1c15636ed9033e09164fda9d74a53f0dfccf2fbdd3608ac299b32a832ad" +
      "630c448b4d6453f4e5a2ba67bdc02009869a770f8a78b1a819a96a4f298c6258a582263b7b4" +
      "d62ede9d803RSA4102413SHA512withRSA6259860b0e1da3140abd215401af222e0a72bb84e" +
      "13aa508c0f92cd546ea82bf0203010001";
  private static final String internalString = "1546609850462";
  private static final String activationServer = "https://licensing-test.meteorite.bi/algas/";
  private static final String productID = "1546609850462";
  private static final String nameforValidation = null;
  private static final String companyforValidation = null;
  private static final int hardwareIDMethod = 0;

  public static String fetchLicenseBase64FromServer(String key) throws IOException {
    return new String(Base64Coder.encode(fetchLicenseByteArrayFromServer(key)));
  }

  public static byte[] fetchLicenseByteArrayFromServer(String key) throws IOException {
    SaikuLicense4J license = fetchLicenseFromServer(key);

    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    ObjectOutputStream oos = new ObjectOutputStream(buffer);
    oos.writeObject(license);
    oos.flush();
    oos.close();

    return buffer.toByteArray();
  }

  public static SaikuLicense4J fetchLicenseFromServer(String key) {
    // Fetch the license from server
    final String activationString = activate(key);
    final License activatedLicense = fetchActivatedLicense(activationString);
    final LicenseText licenseText = activatedLicense.getLicenseText();

    // Create a new license object
    SaikuLicense4J saikuLicense = new SaikuLicense4J() {
      @Override
      public void validate(Date currentDate, String currentVersion, boolean hostname, boolean ram, boolean version,
                           boolean expiration) throws bi.meteorite.license.LicenseException {
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

      @Override
      public void validateExpiration(Date currentDate) {
      }

      @Override
      public void validateVersion(String currentVersion) {
      }
    };

    saikuLicense.setName(licenseText.getUserRegisteredTo());
    saikuLicense.setEmail(licenseText.getUserEMail());
    saikuLicense.setLicenseType(AbstractLicense.TYPE_FULL);
    saikuLicense.setExpiration(licenseText.getLicenseExpireDate());
    saikuLicense.setLicenseNumber(Long.toString(licenseText.getLicenseID()));

    return saikuLicense;
  }

  private static String activate(String key) {
    return activate(fetchLicense(key)).getLicenseString();
  }

  private static License activate(License license) {
    return LicenseValidator.autoActivate(license, activationServer);
  }

  private static License fetchLicense(String key) {
    License license = LicenseValidator.validate(
        key,
        publickey,
        internalString,
        nameforValidation,
        companyforValidation,
        hardwareIDMethod);

    return license;
  }

  private static License fetchActivatedLicense(String activationString) {
    final String productEdition = null;
    final String productVersion = null;

    return LicenseValidator.validate(
        activationString,
        publickey,
        productID,
        productEdition,
        productVersion,
        null,
        null);
  }

  public static class SaikuLicense4J extends SaikuLicense2 implements java.io.Serializable {
    // set a fixed serialVersionUID to avoid serialization incompatibilities through different compilations
    private static final long serialVersionUID = 2806421523585360625L;

    public SaikuLicense4J() {
      super();
      this.setMemoryLimit(Integer.MAX_VALUE);
      this.setUserLimit(Integer.MAX_VALUE);
    }

    @Override
    public void validateHostname(String hostname) {
    }

    @Override
    public void validateMemory(int mem) {
    }

    @Override
    public void validate(Date currentDate, String currentVersion, boolean hostname, boolean ram, boolean version,
                         boolean expiration) throws bi.meteorite.license.LicenseException {
      throw new bi.meteorite.license.LicenseException("Implement it");
    }
  }
}
