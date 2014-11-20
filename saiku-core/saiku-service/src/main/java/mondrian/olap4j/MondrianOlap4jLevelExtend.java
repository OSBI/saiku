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
package mondrian.olap4j;

import java.util.Map;

import mondrian.olap.Annotation;
import mondrian.olap.Level;

/**
 * Implementation of {@link org.olap4j.metadata.Level} for the Mondrian OLAP engine.
 * Tweaked by tom
 * @since May 25, 2007
 */
public class MondrianOlap4jLevelExtend extends MondrianOlap4jLevel
    {


      /**
       * Creates a MondrianOlap4jLevel.
       *  @param olap4jSchema Schema
       * @param level        Mondrian level
       */
      public MondrianOlap4jLevelExtend(org.olap4j.metadata.Level level) {
        super(((MondrianOlap4jLevel)level).olap4jSchema, ((MondrianOlap4jLevel)level).level);
      }

      public Map<String, Annotation> getAnnotations() {
    return level.getAnnotationMap();
  }

}

// End MondrianOlap4jLevel.java
