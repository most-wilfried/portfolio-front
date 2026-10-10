import {
  DiAndroid,
  DiApple,
  DiAws,
  DiCode,
  DiCss3,
  DiDatabase,
  DiDocker,
  DiGithubBadge,
  DiHtml5,
  DiJava,
  DiJavascript1,
  DiLaravel,
  DiLinux,
  DiMongodb,
  DiMysql,
  DiNodejsSmall,
  DiPhp,
  DiPython,
  DiReact,
} from 'react-icons/di';
import { SiArduino, SiCplusplus, SiDart, SiFirebase, SiFlutter, SiGitlab } from 'react-icons/si';

const iconMap = {
  __proto__: null,
  laravel: DiLaravel,
  react: DiReact,
  php: DiPhp,
  javascript: DiJavascript1,
  typescript: DiCode,
  python: DiPython,
  java: DiJava,
  flutter: SiFlutter,
  android: DiAndroid,
  ios: DiApple,
  html: DiHtml5,
  css: DiCss3,
  mysql: DiMysql,
  database: DiDatabase,
  mongodb: DiMongodb,
  node: DiNodejsSmall,
  nodejs: DiNodejsSmall,
  docker: DiDocker,
  linux: DiLinux,
  aws: DiAws,
  arduino: SiArduino,
  esp32: DiCode,
  git: DiGithubBadge,
  github: DiGithubBadge,
  firebase: SiFirebase,
  gitlab: SiGitlab,
  dart: SiDart,
  'c++': SiCplusplus,
};

export function getTechIcon(name) {
  const key = name?.trim().toLowerCase();
  const IconComponent = iconMap[key] || iconMap[key?.replace(/\s+/g, '')] || DiCode;

  return <IconComponent aria-hidden="true" />;
}
