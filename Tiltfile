# TheCrew - Local Development with k3d + Tilt

allow_k8s_contexts('k3d-the-crew')
default_registry('localhost:5050')

# --- Namespace ---
k8s_yaml('infra/k8s/namespace.yaml')

# --- Docker builds ---
docker_build(
    'the-crew/platform',
    '.',
    dockerfile='infra/docker/Dockerfile.nestjs',
    build_args={'SERVICE_PATH': 'services/platform'},
)

docker_build(
    'the-crew/company-design',
    '.',
    dockerfile='infra/docker/Dockerfile.nestjs',
    build_args={'SERVICE_PATH': 'services/company-design'},
)

docker_build(
    'the-crew/api-gateway',
    '.',
    dockerfile='infra/docker/Dockerfile.nestjs',
    build_args={'SERVICE_PATH': 'apps/api-gateway'},
)

docker_build(
    'the-crew/web',
    '.',
    dockerfile='infra/docker/Dockerfile.web',
)

docker_build(
    'the-crew/temporal-worker',
    '.',
    dockerfile='infra/docker/Dockerfile.temporal-worker',
)

# --- K8s resources ---
k8s_yaml('infra/k8s/postgres.yaml')
k8s_yaml('infra/k8s/redis.yaml')
k8s_yaml('infra/k8s/mongodb.yaml')
k8s_yaml('infra/k8s/temporal.yaml')
k8s_yaml('infra/k8s/platform.yaml')
k8s_yaml('infra/k8s/company-design.yaml')
k8s_yaml('infra/k8s/temporal-worker.yaml')
k8s_yaml('infra/k8s/api-gateway.yaml')
k8s_yaml('infra/k8s/web.yaml')

# --- Resource config ---
k8s_resource('postgres', labels=['infra'])
k8s_resource('redis', labels=['infra'])
k8s_resource('mongodb', labels=['infra'])
k8s_resource('temporal', port_forwards='7233:7233', resource_deps=['postgres'], labels=['infra'])
k8s_resource('temporal-ui', port_forwards='8233:8080', resource_deps=['temporal'], labels=['infra'])

k8s_resource(
    'platform',
    port_forwards='4010:4010',
    resource_deps=['postgres', 'redis'],
    labels=['services'],
)

k8s_resource(
    'company-design',
    port_forwards='4020:4020',
    resource_deps=['postgres', 'redis'],
    labels=['services'],
)

k8s_resource(
    'temporal-worker',
    port_forwards='4030:4030',
    resource_deps=['temporal'],
    labels=['services'],
)

k8s_resource(
    'api-gateway',
    port_forwards='4000:4000',
    resource_deps=['platform', 'company-design'],
    labels=['apps'],
)

k8s_resource(
    'web',
    port_forwards='3000:80',
    resource_deps=['api-gateway'],
    labels=['apps'],
)
