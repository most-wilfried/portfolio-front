import * as DiIcons from 'react-icons/di';

const iconMap = {
  laravel: 'DiLaravel',
  react: 'DiReact',
  php: 'DiPhp',
  javascript: 'DiJavascript1',
  typescript: 'DiCode',
  python: 'DiPython',
  java: 'DiJava',
  flutter: 'DiFlutter',
  android: 'DiAndroid',
  ios: 'DiApple',
  html: 'DiHtml5',
  css: 'DiCss3',
  mysql: 'DiMysql',
  database: 'DiDatabase',
  mongodb: 'DiMongodb',
  node: 'DiNodejsSmall',
  nodejs: 'DiNodejsSmall',
  docker: 'DiDocker',
  linux: 'DiLinux',
  aws: 'DiAws',
  arduino: 'DiArduino',
  esp32: 'DiCode',
  git: 'DiGithubBadge',
  github: 'DiGithubBadge',
};

export function getTechIcon(name) {
  const key = name?.trim().toLowerCase();
  const iconName = iconMap[key] || iconMap[key?.replace(/\s+/g, '')] || 'DiCode';
  const IconComponent = DiIcons[iconName] || DiIcons.DiCode;

  return <IconComponent />;
}
