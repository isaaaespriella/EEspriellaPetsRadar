import appInsights from 'applicationinsights';
import { logger } from '../config/logger';

export function startApplicationInsights(): void {
  const cs = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!cs) {
    logger.info('Application Insights omitido (sin APPLICATIONINSIGHTS_CONNECTION_STRING)');
    return;
  }
  appInsights
    .setup(cs)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setSendLiveMetrics(false)
    .start();
  logger.info('Application Insights iniciado');
}
