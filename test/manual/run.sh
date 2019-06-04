#!/usr/bin/env bash

set -e

apiKey=fake
frontEndpoint=https://builds.steffenl.com
apiEndpoint=https://builds.steffenl.com/api
authHeader="Authorization: ${apiKey}"
contentHeader="Content-Type: application/json"

function _httpPostFile {
    local path=${1}
    local file=${2}

    curl -sS -H "${authHeader}" -F "${file}" "${apiEndpoint}${path}" | jq
}

function _httpPost {
    local path=${1}
    local data=${2}

    curl -sS -H "${authHeader}" -H "${contentHeader}" -d "${data}" "${apiEndpoint}${path}" | jq
}
function _httpPut {
    local path=${1}
    local data=${2}

    curl -sS -X PUT -H "${authHeader}" -H "${contentHeader}" -d "${data}" "${apiEndpoint}${path}" | jq
}

function _httpGet {
    local path=${1}

    curl -sS -H "${authHeader}" -H "${contentHeader}" "${apiEndpoint}${path}" | jq
}

function uploadAsset {
    local app=${1}
    local release=${2}
    local path=${3}
    local name=${4}

    if [[ -z "${name}" ]]; then
        name=${path}
    fi

    _httpPostFile "/release/${app}/${release}/asset" "asset=@${path};filename=${name}"
}

# Create an app
_httpPost /app '{"name": "myapp", "title": "My App", "description": "Fake app."}'

# Create some releases
_httpPost /release/myapp '{"version": "0.1-dev", "title": "Fake release 1", "description": "Description for fake release.", "commit": "fake"}'
_httpPost /release/myapp '{"version": "0.1", "title": "Fake release 2", "description": "Description for fake release.", "commit": "fake"}'
_httpPost /release/myapp '{"version": "0.2-dev", "title": "Fake release 3", "description": "Description for fake release.", "commit": "fake"}'

# Upload some assets
uploadAsset myapp 0.1-dev dummy-asset.txt dummy.txt
uploadAsset myapp 0.1 dummy-asset.txt dummy.txt

# Publish releases
_httpPut /release/myapp/0.1-dev '{"draft": false}'
_httpPut /release/myapp/0.1 '{"draft": false}'
_httpPut /release/myapp/0.2-dev '{"draft": false}'

# Get all stable releases
_httpGet /release/myapp

# Get all stable releases and prereleases
_httpGet /release/myapp?edge=1

# Get latest stable release
_httpGet /release/myapp/latest

# Get latest prerelease or stable release
_httpGet /release/myapp/latest?edge=1

# Get assets for release
_httpGet '/release/myapp/0.1?include=asset,digest'

# Download asset
curl -sS -H "${authHeader}" "${frontEndpoint}/download/myapp/0.1-dev/dummy.txt"
curl -sS -H "${authHeader}" "${frontEndpoint}/download/myapp/0.1/dummy.txt"
