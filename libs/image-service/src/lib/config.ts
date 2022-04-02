interface ImageServiceConfig {
  imageBasePath: string;
}
const config: ImageServiceConfig = {
  imageBasePath:
    process.env?.IMAGE_BASE_PATH ?? './apps/flaggle-ui/src/assets/',
};

export default config;
