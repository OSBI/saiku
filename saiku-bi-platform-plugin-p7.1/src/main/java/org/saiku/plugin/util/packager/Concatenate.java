package org.saiku.plugin.util.packager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.util.Enumeration;
import java.util.NoSuchElementException;

class Concatenate
{

  public static InputStream concat(File[] files)
  {
    ListOfFiles mylist = new ListOfFiles(files);

    return new SequenceInputStream(mylist);
  }

 
}

class ListOfFiles implements Enumeration<FileInputStream>
{

  private final File[] listOfFiles;
  private int current = 0;

  public ListOfFiles(File[] listOfFiles)
  {
    this.listOfFiles = listOfFiles;
  }

  public boolean hasMoreElements()
  {
    return current < listOfFiles.length;
  }

  public FileInputStream nextElement()
  {
    FileInputStream in = null;

    if (!hasMoreElements())
    {
      throw new NoSuchElementException("No more files.");
    }
    else
    {
      File nextElement = listOfFiles[current];
      current++;
      try
      {
        in = new FileInputStream(nextElement);
      }
      catch (FileNotFoundException e)
      {
        System.err.println("ListOfFiles: Can't open " + nextElement);
      }
    }
    return in;
  }
}
