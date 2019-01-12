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
    return new SaikuLicense4J(key);
  }

  public static String activate(String key) {
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

  public static License fetchActivatedLicense(String activationString) {
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
}
