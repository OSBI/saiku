/*
 * Copyright (c) 2012 David Stites, Patrik Dufresne and others.
 * 
 * You may distribute under the terms of either the MIT License, the Apache
 * License 2.0 or the Simplified BSD License, as specified in the README file.
 * 
 * Contributors:
 *     David Stites - initial API and implementation
 *     Patrik Dufresne - refactoring
 */
package org.saiku.service.license;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Set;

/**
 * This class is useful to generate key to identify a specific hardware using
 * the network card.
 *
 * @author Patrik Dufresne
 */
public class KeyManager {
  /**
   * Define the default key length.
   */
  private static final int DEFAULT_KEY_LENGTH = 62;

  /**
   * Defin the default default mac address.
   */
  private static final byte[] DEFAULT_MAC_ADRESS = new byte[] { 24, 4, 124,
                                                                10, 91 };
  private static final byte[][] DEFAULT_PARAMS = new byte[][] {
      { 24, 4, 127 }, { 10, 0, 56 }, { 1, 2, 91 }, { 7, 1, 100 } };

  /**
   * Calculate a checksum.
   *
   * @param string
   * @return the check sum value
   */
  private static String calculateChecksum(final String string) {
    int left = 0x0056;
    int right = 0x00AF;
    for (byte b : string.getBytes()) {
      right += b;
      if (right > 0x00FF) {
        right -= 0x00FF;
      }
      left += right;
      if (left > 0x00FF) {
        left -= 0x00FF;
      }
    }
    int sum = (left << 8) + right;
    return intToHex(sum, 4);
  }

  /**
   * Get the key bytes.
   *
   * @param seed
   * @param a
   * @param b
   * @param c
   * @return
   */
  private static byte getKeyByte(final int seed, final byte a, final byte b,
                                 final byte c) {
    final int a1 = a % 25;
    final int b1 = b % 3;
    if (a1 % 2 == 0) {
      return (byte) (((seed >> a1) & 0x000000FF) ^ ((seed >> b1) | c));
    } else {
      return (byte) (((seed >> a1) & 0x000000FF) ^ ((seed >> b1) & c));
    }

  }

  /**
   * @param n
   * @param chars
   * @return
   */
  private static String intToHex(final Number n, final int chars) {
    return String.format("%0" + chars + "x", n);
  }

  /**
   * Sets of black listed keys.
   */
  private Set<String> blacklist;

  /**
   * Default MAC address if no network interface is available.
   */
  private byte[] defaultMac;

  /**
   * The current key length.
   */
  private int keyLen;

  /**
   * Arrays used to generate and validate the key.
   */
  private byte[][] params;

  public KeyManager() {
    this(DEFAULT_KEY_LENGTH, DEFAULT_PARAMS, DEFAULT_MAC_ADRESS);
  }

  /**
   * @param keyLen            the key length (>=8);
   * @param params
   * @param defaultMacAddress used if no network interface is available
   */
  public KeyManager(int keyLen, byte[][] params, byte[] defaultMacAddress) {
    if (keyLen < 8) {
      throw new IllegalArgumentException("keyLen<8");
    }
    this.keyLen = keyLen;

    this.params = params;

    this.defaultMac = defaultMacAddress;

  }

  /**
   * Ass the given key to the black list.
   *
   * @param key the key to be added
   */
  public void addBlackListedKey(String key) {
    if (this.blacklist == null) {
      this.blacklist = new HashSet<String>();
    }
    this.blacklist.add(key);
  }

  /**
   * @param seed
   * @param entropy
   * @return
   */
  public String generateKey(final int seed, String authCode) {

    byte[] entropy = getHardwareEntropy();

    final byte[] keyBytes = new byte[25];
    // fill keyBytes with values derived from seed.
    // the parameters used here must be exactly the same
    // as the ones used in the checkKey function.
    keyBytes[0] = getKeyByte(seed, params[0][0], params[0][1], params[0][2]);
    keyBytes[1] = getKeyByte(seed, params[1][0], params[1][1], params[1][2]);
    keyBytes[2] = getKeyByte(seed, params[2][0], params[2][1], params[2][2]);
    keyBytes[3] = getKeyByte(seed, params[3][0], params[3][1], params[3][2]);
    for (int i = 4, j = 0; (j + 2) < entropy.length; i++, j += 3) {
      keyBytes[i] = getKeyByte(seed, entropy[j], entropy[j + 1],
                               entropy[j + 2]);
    }

    // The key string begins with a hexadecimal string of the seed
    final StringBuilder result = new StringBuilder(intToHex(seed, 8));

    // Then is followed by hexadecimal strings of each byte in the key
    for (byte b : keyBytes) {
      result.append(intToHex(b, 2));
    }

    // Add checksum to key string
    String key = result.toString();
    key += calculateChecksum(key);

    return key;
  }

  /**
   * Return the complete list of blackl listed key.
   *
   * @return
   */
  public String[] getBlackListedKeys() {
    if (this.blacklist == null) {
      return new String[0];
    }
    String[] list = new String[this.blacklist.size()];
    return this.blacklist.toArray(list);
  }

  /**
   * Generate an hardate entropy based on the network address.
   *
   * @return the hardware entropy value.
   */
  private byte[] getHardwareEntropy() {
    // Get the MAC address value
    byte[] mac;
    try {
      NetworkInterface ni = NetworkInterface.getByInetAddress(InetAddress
                                                                  .getLocalHost());
      if (ni != null) {
        mac = ni.getHardwareAddress();
        if (mac == null) {
          mac = defaultMac;
        }
      } else {
        mac = defaultMac;
      }
    } catch (Exception ex) {
      mac = defaultMac;
    }

    // Hash the value
    byte[] entropyEncoded = null;
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-512");
      digest.reset();
      entropyEncoded = digest.digest(mac);
    } catch (NoSuchAlgorithmException ex) { /* this will never happen */
    }

    return entropyEncoded;
  }

  /**
   * Remove the given key from the black list.
   *
   * @param key the key to remove.
   */
  public void removeBlackListedKey(String key) {
    if (this.blacklist != null) {
      this.blacklist.remove(key);
      if (this.blacklist.size() == 0) {
        this.blacklist = null;
      }
    }
  }

  /**
   * Check if a key is valid.
   *
   * @param key the key to validate
   * @throws KeyInvalidException if the key is invalid
   */
  public void validateKey(final String key) throws KeyInvalidException,
      KeyBlackListedException {
    // Validate the key checksum
    if (!validateKeyChecksum(key)) {
      throw new KeyInvalidException();
    }

    // Look at the black list.
    if (this.blacklist != null) {
      for (String black : this.blacklist) {
        if (key.startsWith(black)) {
          throw new KeyBlackListedException();
        }
      }
    }

    // At this point, the key is either valid or forged,
    // because a forged key can have a valid checksum.
    // we now test the "bytes" of the key to determine if it is
    // actually valid.

    // When building your release application, use conditional defines
    // or comment out most of the byte checks! this is the heart
    // of the partial key verification system. by not compiling in
    // each check, there is no way for someone to build a keygen that
    // will produce valid keys. if an invalid keygen is released, you can
    // simply change which byte checks are compiled in, and any serial
    // number built with the fake keygen no longer works.

    // note that the parameters used for getKeyByte calls MUST
    // MATCH the values that makeKey uses to make the key in the
    // first place!

    // Extract the seed from the supplied key string
    final int seed;
    try {
      seed = Integer.valueOf(key.substring(0, 8), 16);
    } catch (NumberFormatException e) {
      throw new KeyInvalidException();
    }

    // test key 0
    final String kb0 = key.substring(8, 10);
    final byte b0 = getKeyByte(seed, params[0][0], params[0][1],
                               params[0][2]);
    if (!kb0.equals(intToHex(b0, 2))) {
      throw new KeyInvalidException();
    }

    // test key1
    final String kb1 = key.substring(10, 12);
    final byte b1 = getKeyByte(seed, params[1][0], params[1][1],
                               params[1][2]);
    if (!kb1.equals(intToHex(b1, 2))) {
      throw new KeyInvalidException();
    }

    // test key2
    final String kb2 = key.substring(12, 14);
    final byte b2 = getKeyByte(seed, params[2][0], params[2][1],
                               params[2][2]);
    if (!kb2.equals(intToHex(b2, 2))) {
      throw new KeyInvalidException();
    }

    // test key3
    final String kb3 = key.substring(14, 16);
    final byte b3 = getKeyByte(seed, params[3][0], params[3][1],
                               params[3][2]);
    if (!kb3.equals(intToHex(b3, 2))) {
      throw new KeyInvalidException();
    }

    // test the hardware entropy
    byte[] encodedEntropy = getHardwareEntropy();
    for (int i = 16, j = 0; (j + 2) < encodedEntropy.length; i += 2, j += 3) {
      String kb = key.substring(i, i + 2);
      byte b = getKeyByte(seed, encodedEntropy[j], encodedEntropy[j + 1],
                          encodedEntropy[j + 2]);
      if (!kb.equals(intToHex(b, 2))) {
        throw new KeyInvalidException();
      }
    }

  }

  /**
   * Validate the key check sum.
   *
   * @param key the key value
   * @return
   */
  private boolean validateKeyChecksum(final String key) {
    if (key.length() != this.keyLen) {
      throw new IllegalArgumentException("key wrong length");
    }
    // last four characters are the checksum
    final String checksum = key.substring(this.keyLen - 4);
    return checksum.equals(calculateChecksum(key.substring(0,
                                                           this.keyLen - 4)));
  }

}
