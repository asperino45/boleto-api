ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# export API_VERSION_TAG=0.0.1
export API_IMAGE_NAME=ewally/boleto-api
export API_CONTAINER=boleto-api

# Expor porta padrão de debug do node
export API_DEBUG_PORT_MAP?=9229:$(API_DEBUG_PORT)
export HOST_PORT?=3000
export API_PORT_MAP?=$(HOST_PORT):$(API_PORT)

export NETWORK=ewally

# opções no Dockerfile: BASE, DEV==TEST, PROD
export TARGET?=dev
export NODE_PKG?=yarn
export PKG_CMD?=start:$(TARGET)
export APP_CMD?=$(NODE_PKG) run $(PKG_CMD)

export API_IMAGE_TAG=$(API_IMAGE_NAME):$(API_VERSION_TAG)
export CURRENT_UID=$(shell id -u):$(shell id -g)

all: stop-remove-containers server-dev

build:
	@echo "Construindo a imagem do Docker em $(TARGET)"
	@if [ -z "$(shell docker images -q $(API_IMAGE_NAME):latest 2> /dev/null)" ]; then \
		docker build -t $(API_IMAGE_NAME) --target $(TARGET) --rm . ;\
	else \
		echo "A imagem $(API_IMAGE_NAME):latest já existe"; \
	fi

build-prod:
	@echo "Construindo a imagem do Docker em PROD"
	docker build --no-cache -t $(API_IMAGE_TAG) --target prod --rm .

# Executa servidor em modo de desenvolvimento
server-dev: prepare build npm-install
	@echo "Subindo a imagem $(API_IMAGE_NAME):latest com o nome $(API_CONTAINER)-$(TARGET)"
	@docker run -it --rm \
		--init \
		--name $(API_CONTAINER)-$(TARGET) \
		--network $(NETWORK) \
		--env-file './.env' \
		--user $(CURRENT_UID) \
		-v $(PWD):/app \
		-p $(API_PORT_MAP) \
		-p $(API_DEBUG_PORT_MAP) \
		$(API_IMAGE_NAME)

# Executa servidor em modo de produção
server-prod: prepare build-prod
	@echo "Subindo a imagem $(API_IMAGE_TAG) com o nome $(API_CONTAINER)"
	docker run -d \
		--init \
		--name $(API_CONTAINER) \
		--network $(NETWORK) \
		--restart unless-stopped \
		--env-file './.env' \
		-p $(API_PORT_MAP) \
		$(API_IMAGE_TAG)

# Executa um container com shell interativo
shell: prepare build
	@docker run -it --rm \
		--name $(API_CONTAINER)-shell \
		--network $(NETWORK) \
		--user $(CURRENT_UID) \
		-v $(PWD):/app \
		$(API_IMAGE_NAME) /bin/sh

shell-exec: prepare build
	@docker exec -it \
	--user $(CURRENT_UID) \
	-w /app $(API_CONTAINER)-shell /bin/sh

npm-install: prepare build
	@if [ ! -d "node_modules" ]; then \
		echo "Instalando dependencias do node" ;\
		docker run -it --rm \
			--init \
			--name $(API_CONTAINER)-shell \
			--network $(NETWORK) \
			--user $(CURRENT_UID) \
			-p $(API_PORT_MAP) \
			-v $(PWD):/app \
			$(API_IMAGE_NAME) $(NODE_PKG) install ;\
	else \
		echo "Dependencias do node já foram instaladas" ;\
	fi

# Testes
test-unit-debug:
	$(MAKE) test-unit-dev TEST_CMD="yarn run test:debug"

test-unit-dev: TEST_CMD?=$(NODE_PKG) run test:watch
test-unit-dev: prepare build
	@echo "Rodando teste da imagem $(API_IMAGE_NAME) com nome $(API_CONTAINER)-test"
	@docker run -it --rm \
		--name $(API_CONTAINER)-test \
		--env-file './.env' \
		--network $(NETWORK) \
		-p $(API_PORT_MAP) \
		-p $(API_DEBUG_PORT_MAP) \
		-v $(PWD):/app \
		$(API_IMAGE_NAME) $(TEST_CMD)

test-unit: build-prod
	@echo "Rodando teste da imagem $(API_IMAGE_TAG) com nome $(API_CONTAINER)-test"
	@docker run -it --rm \
		--init \
		--name $(API_CONTAINER)-test \
		--env-file './.env' \
		-p $(API_PORT_MAP) \
		$(API_IMAGE_TAG) $(NODE_PKG) run test

test-e2e-dev: build
	@echo "Rodando teste da imagem $(API_IMAGE_TAG) com nome $(API_CONTAINER)-test"
	@docker run -it --rm \
		--init \
		--name $(API_CONTAINER)-test \
		--network $(NETWORK) \
		--env-file './.env' \
		-p $(API_PORT_MAP) \
		$(API_IMAGE_TAG) $(NODE_PKG) run test:e2e:watch

test-e2e: build
	@echo "Rodando teste da imagem $(API_IMAGE_TAG) com nome $(API_CONTAINER)-test"
	@docker run -it --rm \
		--init \
		--name $(API_CONTAINER)-test \
		--network $(NETWORK) \
		--env-file './.env' \
		-p $(API_PORT_MAP) \
		$(API_IMAGE_TAG) $(NODE_PKG) run test:e2e

test-cov: build
	@echo "Rodando teste da imagem $(API_IMAGE_TAG) com nome $(API_CONTAINER)-test"
	@docker run -it --rm \
		--init \
		--name $(API_CONTAINER)-test \
		--network $(NETWORK) \
		--env-file './.env' \
		-p $(API_PORT_MAP) \
		$(API_IMAGE_TAG) $(NODE_PKG) run test:cov

# Prepara o ambiente
prepare:
	# Prepara a rede para os containers de dev
	@if ! docker network inspect $(NETWORK) >/dev/null 2>&1; then \
		docker network create $(NETWORK) 2>/dev/null || true; fi

stop-remove-containers: stop-containers
	-@docker rm -f \
		$(API_CONTAINER) \
		$(API_CONTAINER)-$(TARGET) \
		$(API_CONTAINER)-test \
		$(API_CONTAINER)-shell 2>/dev/null || true; \

clean: stop-containers
	docker rm -fv \
		$(API_CONTAINER) \
		$(API_CONTAINER)-$(TARGET) \
		$(API_CONTAINER)-test \
		$(API_CONTAINER)-shell 2>/dev/null || true
	docker image rm \
		$(API_IMAGE_TAG) \
		$(API_IMAGE_NAME) 2>/dev/null || true
	docker system prune -f --volumes
	rm -rf dist/ node_modules/ coverage/

stop-containers:
	@echo "Parando containers das imagens: $(API_IMAGE_NAME) $(API_IMAGE_TAG)."
	@( set -e ;\
	CONTAINERS="$$(docker ps -q --filter ancestor=$(API_IMAGE_TAG))" ;\
	CONTAINERS="$$CONTAINERS $$(docker ps -q --filter ancestor=$(API_IMAGE_NAME))" ;\
	[ -n "$$CONTAINERS" ] && docker stop $$CONTAINERS 2>/dev/null || true ;\
	)

.PHONY: prepare test-unit test-unit-dev test-e2e test-e2e-dev test-cov
.PHONY: build build-prod
.PHONY: shell npm-install server-dev server-prod
.PHONY: compose all clean stop-containers stop-remove-containers

