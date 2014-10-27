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
package org.saiku.service;

import org.saiku.service.util.dto.Plugin;

import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.FilenameFilter;
import java.util.ArrayList;

/**
 * PlatformUtilsService.
 */
public class PlatformUtilsService {

  private String filePath;

  @Autowired
  public void setPath(String path) {
    this.filePath = path;
  }

  public String getPath() {
    return filePath;
  }


  @NotNull
  public ArrayList<Plugin> getAvailablePlugins() {
    ArrayList l = new ArrayList<Plugin>();
    File f = new File(filePath);

    String[] directories = f.list(new FilenameFilter() {
      public boolean accept(File current, @NotNull String name) {
        return new File(current, name).isDirectory();
      }
    });

    if (directories != null && directories.length > 0) {
      for (String d : directories) {
        File subdir = new File(filePath + "/" + d);
        File[] subfiles = subdir.listFiles();

        /**
         * TODO use a metadata.js file for alternative details.
         */
        if (subfiles != null) {
          for (File s : subfiles) {
            if (s.getName().equals("plugin.js")) {
              Plugin p = new Plugin(s.getParentFile().getName(),
                  "js/saiku/plugins/" + s.getParentFile().getName() + "/plugin.js");
              l.add(p);
            }
          }
        }
      }
    }
    return l;
  }
}
