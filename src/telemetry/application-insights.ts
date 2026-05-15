import { logger } from '../config/logger';
import appInsights = require('applicationinsights');

function resolveInsightsSetupValue(): string | undefined {
  const fromEnv = [
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    process.env.APPINSIGHTS_CONNECTION_STRING,
    process.env.APPLICATIONINSIGHTS_INSTRUMENTATIONKEY,
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  ];
  for (const raw of fromEnv) {
    const v = raw?.trim();
    if (!v) continue;
    if (v.includes('InstrumentationKey=') || v.includes('IngestionEndpoint=')) {
      return v;
    }
    if (/^[0-9a-f-]{36}$/i.test(v)) {
      return v;
    }
    return v;
  }
  return undefined;
}

export function startApplicationInsights(): void {
  const setupValue = resolveInsightsSetupValue();
  if (!setupValue) {
    logger.info(
      'Application Insights omitido: define APPLICATIONINSIGHTS_CONNECTION_STRING (entre comillas en .env) o APPINSIGHTS_INSTRUMENTATIONKEY',
    );
    return;
  }
  if (typeof appInsights.setup !== 'function') {
    logger.error('Application Insights: SDK sin setup()');
    return;
  }
  try {
    appInsights
      .setup(setupValue)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setSendLiveMetrics(false)
      .start();
    logger.info('Application Insights iniciado (SDK activo)');
  } catch (e) {
    logger.error('Application Insights no pudo iniciarse', { error: String(e) });
  }
}
