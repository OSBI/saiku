package org.saiku.license;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Unnamed user counter.
 */
class SaikuCounter implements Serializable{

  private final Map<String,Integer> counter = new HashMap<>();

  public SaikuCounter() {
  }

  public void updateCounter(String username){
    if(counter.containsKey(username)) {
      counter.put(username, counter.get(username) + 1);
    }
    else{
      counter.put(username, 0);
    }
  }

  public void updateCounter(String username, int count){

  }

  public Integer getCount(String username){
    if(counter.containsKey(username)) {
      return counter.get(username);
    }
    else{
      return 0;
    }
  }
}
