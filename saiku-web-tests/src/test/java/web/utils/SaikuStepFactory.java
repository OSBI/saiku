package web.utils;

import net.serenitybdd.core.di.DependencyInjector;
import net.serenitybdd.jbehave.SerenityCandidateSteps;
import net.serenitybdd.jbehave.SerenityStepContext;
import net.thucydides.core.guice.Injectors;
import net.thucydides.core.steps.PageObjectDependencyInjector;
import net.thucydides.core.steps.StepAnnotations;
import net.thucydides.core.steps.StepFactory;
import net.thucydides.core.steps.di.DependencyInjectorService;
import net.thucydides.core.webdriver.ThucydidesWebDriverSupport;

import org.jbehave.core.configuration.Configuration;
import org.jbehave.core.steps.AbstractStepsFactory;
import org.jbehave.core.steps.CandidateSteps;
import org.jbehave.core.steps.InjectableStepsFactory;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import ch.lambdaj.function.convert.Converter;

import static ch.lambdaj.Lambda.convert;

/**
 * Created by bugg on 16/01/15.
 */
public class SaikuStepFactory extends AbstractStepsFactory {

  private static final ThreadLocal<SerenityStepContext> context = new ThreadLocal<SerenityStepContext>();

  private final LinkedList<Object> rootPackage;
  private ClassLoader classLoader;
  private DependencyInjectorService dependencyInjectorService;

  public SaikuStepFactory(Configuration configuration, LinkedList<Object> rootPackage, ClassLoader classLoader) {
    super(configuration);
    this.rootPackage = rootPackage;
    this.classLoader = classLoader;
    this.dependencyInjectorService = Injectors.getInjector().getInstance(DependencyInjectorService.class);
  }

  private StepFactory getStepFactory() {
    return ThucydidesWebDriverSupport.getStepFactory();
  }

  public List<CandidateSteps> createCandidateSteps() {
    List<CandidateSteps> coreCandidateSteps = super.createCandidateSteps();
    return convert(coreCandidateSteps, toThucydidesCandidateSteps());
  }

  @Override
  protected List<Class<?>> stepsTypes() {
    List<Class<?>> types = new ArrayList<Class<?>>();
    for(Object obj :rootPackage){

      types.add(obj.getClass());
    }
    /*for (Class candidateClass : getCandidateClasses() ){
      if (hasAnnotatedMethods(candidateClass)) {
        types.add(candidateClass);
      }
    }*/
    return types;
  }

  /*private List<Class> getCandidateClasses() {

    List<Class<?>> allClassesUnderRootPackage = ClassFinder.loadClasses().withClassLoader(classLoader).fromPackage(rootPackage);
    List<Class> candidateClasses = Lists.newArrayList();
    for(Class<?> classUnderRootPackage : allClassesUnderRootPackage) {
      if (hasAnnotatedMethods(classUnderRootPackage)) {
        candidateClasses.add(classUnderRootPackage);
      }
    }

    return candidateClasses;
  }*/

  private Converter<CandidateSteps, CandidateSteps> toThucydidesCandidateSteps() {
    return new Converter<CandidateSteps, CandidateSteps>() {
      public CandidateSteps convert(CandidateSteps candidateSteps) {
        return new SerenityCandidateSteps(candidateSteps);
      }
    };
  }

  public Object createInstanceOfType(Class<?> type) {
    Object stepsInstance = getContext().newInstanceOf(type);
    StepAnnotations.injectScenarioStepsInto(stepsInstance, getStepFactory());
    ThucydidesWebDriverSupport.initializeFieldsIn(stepsInstance);
    injectDependencies(stepsInstance);

    return stepsInstance;
  }

  private void injectDependencies(Object stepInstance) {
    List<DependencyInjector> dependencyInjectors = dependencyInjectorService.findDependencyInjectors();
    dependencyInjectors.add(new PageObjectDependencyInjector(ThucydidesWebDriverSupport.getPages()));

    for(DependencyInjector injector : dependencyInjectors) {
      injector.injectDependenciesInto(stepInstance);
    }
  }


  public SerenityStepContext getContext() {
    if (context.get() == null) {
      context.set(new SerenityStepContext());
    }
    return context.get();
  }

  public static void resetContext() {
    context.remove();
  }

  public static SaikuStepFactory withStepsFromPackage(LinkedList<Object> rootPackage, Configuration configuration) {
    return new SaikuStepFactory(configuration, rootPackage, defaultClassLoader());
  }

  private static ClassLoader defaultClassLoader() {
    return Thread.currentThread().getContextClassLoader();
  }

  /*public ThucydidesStepFactory andConfiguration(Configuration configuration) {
    return new ThucydidesStepFactory(configuration, this.rootPackage, this.classLoader);
  }*/

  public InjectableStepsFactory andClassLoader(ClassLoader classLoader) {
    this.classLoader = classLoader;
    return this;
  }
}
