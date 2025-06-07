import { defaultConfig, type EstablishmentConfig } from '@/config/establishment'

export function useEstablishmentConfig() {
  // TODO: Implementar busca da configuração do estabelecimento do banco de dados
  const config = defaultConfig

  function getLabel(key: keyof EstablishmentConfig['labels']) {
    return config.labels[key]
  }

  function getFeature(key: keyof EstablishmentConfig['features']) {
    return config.features[key]
  }

  function getThemeColor(key: keyof EstablishmentConfig['theme']) {
    return config.theme[key]
  }

  function getValue<K extends keyof EstablishmentConfig>(
    key: K
  ): EstablishmentConfig[K] {
    return config[key]
  }

  return {
    config,
    getLabel,
    getFeature,
    getThemeColor,
    getValue,
  }
}
