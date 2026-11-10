# Enterprise Playwright Framework — developer commands
# Run `make help` to list all targets.

SHELL := /bin/bash
.DEFAULT_GOAL := help

PROJECT      ?= chromium
ENVIRONMENT  ?= staging
SHARD_TOTAL  ?= 4
IMAGE        ?= enterprise-playwright-framework
K8S_NS       ?= qa-automation

# ── Setup ────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Install dependencies and all browser binaries
	pnpm install
	pnpm exec playwright install

.PHONY: install
install: ## Install node dependencies only
	pnpm install

.PHONY: browsers
browsers: ## Install browser binaries only
	pnpm exec playwright install

.PHONY: clean
clean: ## Remove test artifacts, caches, and logs
	rm -rf test-results playwright-report blob-report .auth logs
	find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

# ── Quality ──────────────────────────────────────────────────────────────────
.PHONY: lint
lint: ## TypeScript strict typecheck (tsc --noEmit)
	pnpm lint

.PHONY: list
list: ## List all collected tests
	pnpm exec playwright test --list

.PHONY: doctor
doctor: ## Verify environment: node, pnpm, browsers, env config
	@node -v
	@pnpm -v
	@pnpm exec playwright --version
	@echo "env=$(ENVIRONMENT) base-url=$${BASE_URL:-https://www.saucedemo.com}"
	@curl -sI --max-time 10 "$${BASE_URL:-https://www.saucedemo.com}" | head -1 || echo "WARN: target unreachable"

# ── Test runs ────────────────────────────────────────────────────────────────
.PHONY: test
test: ## Run full suite ($(PROJECT) project)
	pnpm exec playwright test --project=$(PROJECT)

.PHONY: smoke
smoke: ## Run @smoke subset
	pnpm exec playwright test --project=$(PROJECT) --grep "@smoke"

.PHONY: regression
regression: ## Run everything except @smoke
	pnpm exec playwright test --project=$(PROJECT) --grep-invert "@smoke"

.PHONY: e2e
e2e: ## Run functional e2e suite only
	pnpm exec playwright test --project=$(PROJECT) tests/e2e

.PHONY: test-chromium
test-chromium: ## Chromium project
	pnpm exec playwright test --project=chromium

.PHONY: test-firefox
test-firefox: ## Firefox project
	pnpm exec playwright test --project=firefox

.PHONY: test-webkit
test-webkit: ## WebKit project
	pnpm exec playwright test --project=webkit

.PHONY: test-mobile
test-mobile: ## Mobile Chrome project
	pnpm exec playwright test --project=mobile-chrome

.PHONY: headed
headed: ## Run $(PROJECT) headed
	pnpm exec playwright test --project=$(PROJECT) --headed

.PHONY: debug
debug: ## Run $(PROJECT) under the inspector
	pnpm exec playwright test --project=$(PROJECT) --debug

.PHONY: ui
ui: ## Run $(PROJECT) in UI mode
	pnpm exec playwright test --project=$(PROJECT) --ui

# ── Specialty suites ─────────────────────────────────────────────────────────
.PHONY: visual
visual: ## Visual regression suite
	pnpm exec playwright test --project=chromium tests/visual

.PHONY: visual-update
visual-update: ## Regenerate visual baselines
	pnpm exec playwright test --project=chromium tests/visual --update-snapshots

.PHONY: a11y
a11y: ## Accessibility (WCAG 2.1 AA) suite
	pnpm exec playwright test --project=$(PROJECT) tests/accessibility

.PHONY: performance
performance: ## Performance / Core Web Vitals suite
	pnpm exec playwright test --project=$(PROJECT) tests/performance

# ── Reports ──────────────────────────────────────────────────────────────────
.PHONY: report
report: ## Serve the HTML report on :9323
	./scripts/generate-report.sh --serve

.PHONY: report-generate
report-generate: ## Merge blob reports + serve
	./scripts/generate-report.sh

.PHONY: logs-merge
logs-merge: ## Merge per-worker logs → logs/merged.txt, then remove source files
	@ls logs/playwright-*.txt >/dev/null 2>&1 || { echo "✗ No log files in logs/"; exit 1; }
	@FILES=$$(ls logs/playwright-*.txt); \
	LINES=$$(cat $$FILES | wc -l); \
	if [ -f logs/merged.txt ]; then \
		sort -m logs/merged.txt $$FILES > logs/merged.tmp && mv logs/merged.tmp logs/merged.txt; \
	else \
		sort -m $$FILES > logs/merged.txt; \
	fi && \
	rm -f $$FILES && \
	echo "▶ merged $$LINES line(s) from $$(echo $$FILES | wc -w) file(s) → logs/merged.txt (children removed)"

.PHONY: ci-local
ci-local: ## Simulate CI sharding locally ($(SHARD_TOTAL) shards)
	rm -rf blob-report
	for i in $$(seq 1 $(SHARD_TOTAL)); do \
		CI=true pnpm exec playwright test --project=$(PROJECT) --shard=$$i/$(SHARD_TOTAL) || exit 1; \
	done
	pnpm exec playwright merge-reports --reporter html blob-report

.PHONY: shard
shard: ## Run a single shard: make shard I=1
	CI=true pnpm exec playwright test --project=$(PROJECT) --shard=$(I)/$(SHARD_TOTAL)

# ── Docker ───────────────────────────────────────────────────────────────────
.PHONY: docker-build
docker-build: ## Build the test image
	docker build -f docker/Dockerfile -t $(IMAGE):latest .

.PHONY: docker-test
docker-test: ## Run the full suite inside Docker
	docker compose -f docker/docker-compose.yml up --abort-on-container-exit --exit-code-from tests

.PHONY: docker-test-ci
docker-test-ci: ## Run the CI compose profile (limits, no volumes)
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.ci.yml up --abort-on-container-exit --exit-code-from tests

.PHONY: docker-report
docker-report: ## Serve report from the compose stack at :9323
	docker compose -f docker/docker-compose.yml up -d report-server
	@echo "Report: http://localhost:9323"

.PHONY: docker-clean
docker-clean: ## Tear down compose stacks
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.ci.yml down -v --remove-orphans

# ── Kubernetes ───────────────────────────────────────────────────────────────
.PHONY: k8s-apply
k8s-apply: ## Apply namespace + config + secret
	kubectl apply -f k8s/namespace.yml
	kubectl apply -f k8s/configmap.yml
	kubectl apply -f k8s/secret.yml

.PHONY: k8s-run
k8s-run: k8s-apply ## Launch the sharded test job
	kubectl apply -f k8s/test-runner-job.yml
	@kubectl -n $(K8S_NS) get jobs

.PHONY: k8s-logs
k8s-logs: ## Stream test job logs
	kubectl -n $(K8S_NS) logs -f job/playwright-test-runner

.PHONY: k8s-status
k8s-status: ## Show job + pod status
	kubectl -n $(K8S_NS) get job,pods -o wide

.PHONY: k8s-clean
k8s-clean: ## Delete job (keeps namespace/config)
	kubectl -n $(K8S_NS) delete job playwright-test-runner --ignore-not-found

.PHONY: k8s-purge
k8s-purge: ## Delete everything in the test namespace
	kubectl delete namespace $(K8S_NS) --ignore-not-found

# ── Misc ─────────────────────────────────────────────────────────────────────
.PHONY: deps
deps: ## Update dependencies to latest in-range versions
	pnpm update
	pnpm lint

.PHONY: verify
verify: lint smoke ## Typecheck + smoke suite (PR gate)
