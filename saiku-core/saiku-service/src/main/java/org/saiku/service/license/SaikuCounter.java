package org.saiku.service.license;

import org.saiku.license.UserQuota;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Unnamed user counter.
 */
public class SaikuCounter implements Serializable{

  Map<String,Integer> counter = new HashMap<String,Integer>();

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
    if(counter.containsKey(username)){
      counter.put(username, counter.get(username) + count);
    }
    else{
      counter.put(username, count);
    }
  }

  public Integer getCount(String username){
    if(counter.containsKey(username)) {
      return counter.get(username);
    }
    else{
      return 0;
    }
  }

  public List<UserQuota> getQuotaList() {
    if(counter!=null){
      List<UserQuota> l = new ArrayList<>();
      for (Object o : counter.entrySet()) {
        Entry mapping = (Entry) o;
        int rem = 30-(Integer)mapping.getValue();
        UserQuota q = new UserQuota((String)mapping.getKey(), rem);
        l.add(q);
      }
      return l;
    }
    return null;
  }
}
