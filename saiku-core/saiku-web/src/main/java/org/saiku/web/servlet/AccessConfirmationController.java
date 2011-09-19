package org.saiku.web.servlet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
public class AccessConfirmationController extends AbstractController {

	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest arg0,
			HttpServletResponse arg1) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
//
//    private ClientAuthenticationCache authenticationCache = new DefaultClientAuthenticationCache();
//    private ClientDetailsService clientDetailsService;
//
//    @Override
//    protected void initApplicationContext(ApplicationContext context) {
//      super.initApplicationContext(context);
//      Assert.notNull(clientDetailsService, "A client details service must be supplied.");
//    }
//
//    protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
//      ClientAuthenticationToken clientAuth = getAuthenticationCache().getAuthentication(request, response);
//      if (clientAuth == null) {
//        throw new IllegalStateException("No client authentication request to authorize.");
//      }
//
//      ClientDetails client = getClientDetailsService().loadClientByClientId(clientAuth.getClientId());
//      TreeMap<String, Object> model = new TreeMap<String, Object>();
//      model.put("auth_request", clientAuth);
//      model.put("client", client);
//      return new ModelAndView("access_confirmation", model);
//    }
//
//    public ClientAuthenticationCache getAuthenticationCache() {
//      return authenticationCache;
//    }
//
////    @Autowired
//    public void setAuthenticationCache(ClientAuthenticationCache authenticationCache) {
//      this.authenticationCache = authenticationCache;
//    }
//
//    public ClientDetailsService getClientDetailsService() {
//      return clientDetailsService;
//    }
//
//    @Autowired
//    public void setClientDetailsService(ClientDetailsService clientDetailsService) {
//      this.clientDetailsService = clientDetailsService;
//    }
  }
