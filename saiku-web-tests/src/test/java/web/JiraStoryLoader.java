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

package web;

import com.atlassian.jira.rest.client.api.JiraRestClient;
import com.atlassian.jira.rest.client.api.JiraRestClientFactory;
import com.atlassian.jira.rest.client.api.domain.Issue;
import com.atlassian.jira.rest.client.auth.AnonymousAuthenticationHandler;
import com.atlassian.jira.rest.client.internal.async.AsynchronousJiraRestClientFactory;

import org.jbehave.core.io.StoryLoader;

import java.net.URI;

/**
 * Created by bugg on 15/01/15.
 */
public class JiraStoryLoader implements StoryLoader {

  protected String jiraId = "";
  public JiraStoryLoader(String id) {
    jiraId = id;
  }
  public String loadStoryAsText(String issueId) {
    try {
      URI jiraServerUri = new URI("http://jira.meteorite.bi");
      JiraRestClientFactory factory = new AsynchronousJiraRestClientFactory();
      AnonymousAuthenticationHandler h = new AnonymousAuthenticationHandler();
      final JiraRestClient restClient = factory.create(jiraServerUri, h);
      Issue issue = restClient.getIssueClient().getIssue(jiraId).claim();
      return issue.getDescription();
    } catch (Throwable e) {
      System.out.println("error" + e.getLocalizedMessage());
    }
    return null;
  }

}
