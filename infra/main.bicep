targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

param backendServiceName string = ''
param resourceGroupName string = ''

var abbrs = loadJsonContent('abbreviations.json')
var tags = { 'azd-env-name': environmentName }
// Organize resources in a resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

// The application frontend
module frontend 'core/host/staticwebapp.bicep' = {
  name: 'frontend'
  scope: resourceGroup
  params: {
    name: !empty(backendServiceName) ? backendServiceName : '${abbrs.webSitesAppService}frontend-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'frontend' })
  }
}
