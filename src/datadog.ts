import tracer from 'dd-trace';

tracer.init({
  service: 'reachmore-server', // Change this to the name of your service
  env: 'development', // Use 'production' for production environments
});

export default tracer;
