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

package org.saiku.repository;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.List;

/**
 * The list of the available access methods. The NONE access type is the lowest, the GRANT is the highest . Every method
 * implies the preceding
 */
public enum AclMethod {
  NONE,
  READ,
  WRITE,
  GRANT;

  /**
   * calculates the higher (more privileges) of two access methods
   *
   * @param method1
   * @param method2
   * @return
   */
  @Nullable
  private static AclMethod max(@Nullable AclMethod method1, @Nullable AclMethod method2) {
    if (method1 == null) {
      if (method2 == null) {
        throw new RuntimeException("cannot compare two null objects");
      }
      return method2;
    }
    if (toInt(method1) > toInt(method2)) {
      return method1;
    }
    return method2;
  }

  /**
   * Calculates the lower ( less privileges ) of two access methods
   *
   * @param method1
   * @param method2
   * @return
   */
  @Nullable
  private static AclMethod min(@Nullable AclMethod method1, @Nullable AclMethod method2) {
    if (method1 == null) {
      if (method2 == null) {
        throw new RuntimeException("cannot compare two null objects");
      }
      return method2;
    }
    if (toInt(method1) < toInt(method2)) {
      return method1;
    }
    return method2;
  }

  /**
   * Calculates the higher ( more privileges ) of a list of access methods
   *
   * @param methods
   * @return
   */
  @Nullable
  public static AclMethod max(@Nullable List<AclMethod> methods) {
    if (methods != null && methods.size() > 0) {
      AclMethod method = methods.get(0);
      for (int i = 1; i < methods.size(); ++i) {
        method = AclMethod.max(methods.get(i), method);
      }

      return method;
    }
    return NONE;
  }

  /**
   * Calculates the lowest (less privileges ) of a list of access methods
   *
   * @param methods
   * @return
   */
  @Nullable
  public static AclMethod min(@Nullable List<AclMethod> methods) {
    if (methods != null && methods.size() > 0) {
      AclMethod method = methods.get(0);
      for (int i = 1; i < methods.size(); ++i) {
        method = AclMethod.min(methods.get(i), method);
      }

      return method;
    }
    return NONE;
  }

  /**
   * Associates an integer to every access methods. <ul> <li> {@link AclMethod#NONE} : 0 </li> <li> {@link
   * AclMethod#READ} : 1</li> <li> {@link AclMethod#WRITE} : 2</li> <li> {@link AclMethod#GRANT} : 3</li> </ul>
   *
   * @param method
   * @return
   */
  private static int toInt(@NotNull AclMethod method) {
    switch (method) {
    case NONE:
      return 0;
    case READ:
      return 1;
    case WRITE:
      return 2;
    case GRANT:
      return 3;
    }
    return -1; // this shall never happen
  }

}
