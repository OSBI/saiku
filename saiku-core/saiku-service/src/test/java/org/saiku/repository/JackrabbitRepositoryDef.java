/*
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.repository;

import net.thucydides.core.annotations.Steps;
import org.jbehave.core.annotations.*;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.IsCollectionContaining.hasItem;
import static org.junit.Assert.assertNotNull;

/**
 * Created by bugg on 14/05/14.
 */
class JackrabbitRepositoryDef {
    private final List dupliacteUsers = new ArrayList<>();

    @Steps
    private
    JackrabbitSteps data;

    boolean start = false;
    private String datasource;

    @Given("the server is starting up")
    public void givenTheServerIsStartingUp() {
        data.initializeRepository();
        data.startRepository();
    }

    @When("the initialisation is in progress")
    public void whenTheInitialisationIsInProgress() {
        //start = data.startRepository();

    }

    @Then("the jackrabbit repository should start cleanly")
    public void thenTheJackrabbitRepositoryShouldStartCleanly() {
        List<String> names = data.getHomeDirectoryList();
        assertThat(names.size(), equalTo(0));
    }

    private String query;
    @Given("user Joe has created a valid query")
    public void givenUserJoeHasCreatedAValidQuery() throws Exception {
        data.initializeRepository();
        data.startRepository();
        data.initializeUsers(Collections.singletonList("joe"));
        byte[] encoded = sampleQuery();
        query = new String(encoded);
    }

    @When("the query is saved to Joe's home directory")
    public void whenTheQueryIsSavedToJoesHomeDirectory() throws Exception {
        data.saveFile(query, "/homes/home:joe/sample-mdx.saiku", "joe", "nt:saikufiles");
    }

    @Then("it should be stored within the jackrabbit repository in the correct location")
    public void thenItShouldBeStoredWithinTheJackrabbitRepositoryInTheCorrectLocation() throws Exception  {
        String file = data.getFile("/homes/home:joe/sample-mdx.saiku", "joe");
        byte[] encoded = sampleQuery();
        assertThat(file, is(new String(encoded)));
    }

    @Given("an existing repository with content")
    public void givenAnExistingRepositoryWithContent() throws RepositoryException {
        data.initializeRepository();
        data.startRepository();
        data.initializeUsers(Collections.singletonList("joe"));
        datasource = "type=OLAP\n" +
                "name=test\n" +
                "driver=mondrian.olap4j.MondrianOlap4jDriver\n" +
                "location=jdbc:mondrian:Jdbc=jdbc:hsqldb:res:foodmart/foodmart;Catalog=res:FoodMart.xml;\n" +
                "username=sa\n" +
                "password=";
        data.saveFile(datasource, "/homes/home:joe/sampledatasource.sds", "joe", "nt:olapdatasource");
    }

    private byte[] zip = null;

    @When("the export routine is executed")
    public void whenTheExportRoutineIsExecuted() throws IOException, RepositoryException {
        zip = data.getBackup();
    }

    @Then("the server should export the content of the repository to a zip file")
    public void thenTheServerShouldExportTheContentOfTheRepositoryToAZipFile() {
        assertNotNull(zip);
    }

    @Given("user $username has a valid datasource")
    public void givenUserAdminHasAValidDatasource(String username) {
        data.initializeRepository();
        data.startRepository();
        data.initializeUsers(Collections.singletonList(username));
        datasource = "type=OLAP\n" +
                "name=test\n" +
                "driver=mondrian.olap4j.MondrianOlap4jDriver\n" +
                "location=jdbc:mondrian:Jdbc=jdbc:hsqldb:res:foodmart/foodmart;Catalog=res:FoodMart.xml;\n" +
                "username=sa\n" +
                "password=";

    }

    @When("$username saves the datasource")
    public void whenTheySaveTheDatasource(String username) throws RepositoryException {
        data.saveFile(datasource, "/homes/home:" + username + "/sampledatasource.sds", username, "nt:olapdatasource");
    }

    @Then("it should be stored within the jackrabbit repository in the datasource pool for $username")
    public void thenItShouldBeStoredWithinTheJackrabbitRepositoryInTheDatasourcePool(String username) throws RepositoryException {
        String ds = "type=OLAP\n" +
                "name=test\n" +
                "driver=mondrian.olap4j.MondrianOlap4jDriver\n" +
                "location=jdbc:mondrian:Jdbc=jdbc:hsqldb:res:foodmart/foodmart;Catalog=res:FoodMart.xml;\n" +
                "username=sa\n" +
                "password=";
        assertThat(data.getFile("/homes/home:" + username + "/sampledatasource.sds", username), is(ds));
    }


    @Then("jackrabbit should not import the sample data")
    @Pending
    public void thenJackrabbitShouldNotImportTheSampleData() {
        // PENDING
    }

    @Given("a new saiku installation")
    public void givenANewSaikuInstallation() {
        data.initializeRepository();
        data.startRepository();
        // PENDING
    }

    @Given("an existing Saiku installation")
    public void givenAnExistingSaikuInstallation() {
        data.initializeRepository();
        data.startRepository();
        // PENDING
    }

    @When("the server is started")
    public void whenTheServerIsStarted() {
        // PENDING
    }

    @Then("jackrabbit should import sample data to create a working system.")
    @Pending
    public void thenJackrabbitShouldImportSampleDataToCreateAWorkingSystem() {
        // PENDING
    }

    @When("$user moves the $folder node from $source to his $target directory")
    public void whenHeMovesTheFolder1NodeToHisHomeDirectory(String user, String folder, String source, String target) throws RepositoryException {
        data.moveFolder(user, folder, source, target);
    }

    @Then("the $folder node should be moved within $user 's directory")
    public void thenTheFolder1NodeShouldBeMovedWithinTheHomeDirectory(String folder, String user) throws RepositoryException {
        javax.jcr.Node folders = data.getFolders(user, folder);
        assertThat(folders.getName(), is(folder));
    }

    private String schema;

    @Given("user $username has a valid mondrian schema file")
    public void givenUserAdminHasAValidMondrianSchemaFile(String username) throws IOException {
        data.initializeRepository();
        data.startRepository();
        data.initializeUsers(Collections.singletonList(username));
        byte[] encoded = sampleSchema();
        schema = new String(encoded);
    }

    @When("$username hits save that file to the repository schema pool")
    public void whenTheySaveThatFileToTheRepositorySchemaPool(String username) throws RepositoryException {
        data.saveFile(schema, "/homes/home:" + username + "/FoodMart.xml", username, "nt:mondrianschema");
    }

    @Then("the repository stores the schema for $username in the correct location")
    public void thenTheRepositoryStoresTheSchemaInTheCorrectLocation(String username) throws RepositoryException, IOException {
        String file = data.getFile("/homes/home:" + username + "/FoodMart.xml", username);
        byte[] encoded = sampleSchema();
        assertThat(file, is(new String(encoded)));
    }

    @Given("a running server")
    public void givenARunningServer() {
        data.initializeRepository();
        data.startRepository();
    }

    @When("the shutdown is requested")
    public void whenTheShutdownIsRequested() {
        data.shutdownRepository();
    }

    @Then("the repository should be shutdown cleanly")
    public void thenTheRepositoryShouldBeShutdownCleanly() {

    }

    @Given("user $username does not exist")
    public void username_does_not_exist(String username) {
        data.initializeRepository();
        data.startRepository();
        List<String> names = data.getHomeDirectoryList();
        assertThat(names, not(hasItem(username)));
    }

    @When("a new user called $username is added")
    public void username_is_added(String username) {
        data.initializeUsers(Collections.singletonList(username));
        List<String> names = data.getHomeDirectoryList();
        assertThat(names, hasItem(username));
    }

    @When("a second user called $username is added")
    public void second_username_is_added(String username) {
        dupliacteUsers.add(username);
    }

    @Then("a new node called $directory needs creating")
    public void home_directory_creation(String directory) throws RepositoryException {
        Node node = data.getHomeDirectory(directory);
        AclEntry entry = new Acl2(node).getEntry(node.getPath());
        assertThat(entry.getOwner(), equalTo(directory));
    }

    @When("$user adds the $directoryName directory to the home directory")
    public void whenHeAddsTheTestingDirectoryToTheHomeDirectory(String user, String directoryName) throws RepositoryException {
        assertThat(data.createFolder(user, directoryName), is(true));
    }

    @Then("a new node testing is created within the jackrabbit repository")
    public void thenANewNodeTestingIsCreatedWithinTheJackrabbitRepository() {

    }

    @Given("$user has a node within his home directory called $folder")
    public void givenJoeHasANodeWithinHisHomeDirectoryCalledTestingfolder1(String user, String folder) throws RepositoryException {
        data.initializeRepository();
        data.startRepository();

        data.initializeUsers(Collections.singletonList(user));
        List<String> names = data.getHomeDirectoryList();

        assertThat(names, hasItem(user));
        data.createFolder(user, folder);
    }


    @Then("a new node should not be created and an exception thrown")
    public void thenANewNodeShouldNotBeCreatedAndAnExceptionThrown() throws RepositoryException {
        data.initializeDuplicateUsers(dupliacteUsers);
    }

    @Given("a user called $username already exists")
    public void givenUserCalledJoeAlreadyExists(String username) {
        data.initializeRepository();
        data.startRepository();
        data.initializeUsers(Collections.singletonList(username));
        List<String> names = data.getHomeDirectoryList();

        assertThat(names, hasItem(username));
    }

    @Given("user $username has a directory called $folder in his home directory")
    public void givenUserJoeHasADirectoryCalledDeletetestInHisHomeDirectory(String username, String folder) throws RepositoryException {
        data.initializeRepository();
        data.startRepository();
        data.initializeUsers(Collections.singletonList(username));
        List<String> names = data.getHomeDirectoryList();

        assertThat(names, hasItem(username));
        assertThat(data.createFolder(username, folder), is(true));
    }

    @When("user $user deletes his $folder folder")
    public void whenUserJoePressesDelete(String user, String folder) {
        try {
            assertThat(data.deleteFolder(user, folder), is(true));
        } catch (RepositoryException e) {
            e.printStackTrace();
        }

    }

    @Then("the $user 's node $folder should be removed")
    public void thenTheDeletetestNodeShouldBeRemoved(String user, String folder) throws RepositoryException {
        data.getBrokenFolders(user, folder);
    }


    @BeforeScenario
    public void beforeAnyScenario() {
        //data.initializeRepository();
        //data.startRepository();
    }

    @AfterScenario
    public void afterAnyScenario() throws Exception {
        data.shutdownRepository();
        data.cleanRepositoryData();
    }

    @AfterStories
    public void cleanupRepo() throws IOException {
        data.cleanRepositoryData();
    }

    private byte[] sampleSchema() throws IOException {
        String path = JackrabbitRepositoryDef.class.getClassLoader().getResource("FoodMart.xml").getPath();
        return Files.readAllBytes(Paths.get(path));
    }

    private byte[] sampleQuery() throws IOException {
        String path = JackrabbitRepositoryDef.class.getClassLoader().getResource("sample-mdx.saiku").getPath();
        return Files.readAllBytes(Paths.get(path));
    }
}
