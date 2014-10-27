/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.saiku.datasources.connection.encrypt;

import org.jetbrains.annotations.NotNull;
import org.springframework.dao.DataAccessException;

/**
 * TripleDesPasswordEncoder.
 */
class TripleDesPasswordEncoder {

  private final static byte[] defaultKey1 = { (byte) 0x93,
      (byte) 0xa9,
      (byte) 0x0f,
      (byte) 0xb4,
      (byte) 0x57,
      (byte) 0x11,
      (byte) 0x8d,
      (byte) 0x2c };

  private final static byte[] defaultKey2 = { (byte) 0x75,
      (byte) 0x2c,
      (byte) 0xf4,
      (byte) 0x5c,
      (byte) 0x75,
      (byte) 0x15,
      (byte) 0xc6,
      (byte) 0xa3 };

  private Des des;


  /**
   * {@inheritDoc}
   */
  @NotNull
  public String encode(@NotNull String rawPass)
      throws DataAccessException {
    Object salt = null;
    // The password may be empty. Not recommended, but.....
    if (rawPass.length() == 0) {
      return rawPass;
    }

    // We encrypt the NUL to simplify decryption
    int length = rawPass.length() + 1;

    // Make the input string length a multiple of DES_BLOCK_BYTES bytes
    if (length % Des.DES_BLOCK_BYTES != 0) {
      length = length / Des.DES_BLOCK_BYTES * Des.DES_BLOCK_BYTES + Des.DES_BLOCK_BYTES;
    }

    byte[] source = rawPass.getBytes();
    byte[] digest = new byte[length];

    System.arraycopy(source, 0, digest, 0, source.length);

    // Initialize the encryption keys
    setKeys(
        salt);

    // Encrypt the password
    getEncoder().Crypt(digest);

    // Convert the encrypted data to ASCII HEX
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < length; i++) {
      int temp = (int) digest[i] & 0x000000ff;
      if (temp < 16) {
        sb.append('0');
      }
      sb.append(Integer.toHexString(temp));
    }

    return sb.toString();
  }

  void setKeys(Object timestamp) {
    getEncoder().SetKey(true,
        defaultKey1,
        defaultKey2);
  }

  Des getEncoder() {
    if (des == null) {
      des = new Des();
    }
    return des;
  }

}