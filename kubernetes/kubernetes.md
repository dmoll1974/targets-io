## Welcome to MarkdownPad 2 ##

**MarkdownPad** is a full-featured Markdown editor for Windows.

### Built exclusively for Markdown ###

Enjoy first-class Markdown support with easy access to  Markdown syntax and convenient keyboard shortcuts.

Give them a try:

- **Bold** (`Ctrl+B`) and *Italic* (`Ctrl+I`)
- Quotes (`Ctrl+Q`)
- Code blocks (`Ctrl+K`)
- Headings 1, 2, 3 (`Ctrl+1`, `Ctrl+2`, `Ctrl+3`)
- Lists (`Ctrl+U` and `Ctrl+Shift+O`)

### See your changes instantly with LivePreview ###

Don't guess if your [hyperlink syntax](http://markdownpad.com) is correct; LivePreview will show you exactly what your document looks like every time you press a key.

### Make it your own ###

Fonts, color schemes, layouts and stylesheets are all 100% customizable so you can turn MarkdownPad into your perfect editor.

### A robust editor for advanced Markdown users ###

MarkdownPad supports multiple Markdown processing engines, including standard Markdown, Markdown Extra (with Table support) and GitHub Flavored Markdown.

With a tabbed document interface, PDF export, a built-in image uploader, session management, spell check, auto-save, syntax highlighting and a built-in CSS management interface, there's no limit to what you can do with MarkdownPad.

Setup kubernetes cluster on Google Container Engine (GCE)

Set zone for GCE

    export KUBE_GCE_ZONE=europe-west1-d
    

Run kube-up.sh


    cd ~/kubernetes
    clusters/kube-up.sh


Build docker container

    docker build -t gcr.io/targets-io-docker/targets-io .

Push container to GCE container repository

    gcloud docker push gcr.io/targets-io-docker/targets-io

Start MongoDb service

kubectl create -f kubernetes/mongo-service.json

Start MongoDb controller

kubectl create -f kubernetes/mongo-controller.json

Start Memcached service

kubectl create -f kubernetes/memcached-service.json


Start Memcached controller

kubectl create -f kubernetes/memcached-controller.json

Start Graphite frontend service

kubectl create -f kubernetes/graphite-ui-service.json

Start Graphite carbon service

kubectl create -f kubernetes/graphite-carbon-service.json

Start Graphite controller

kubectl create -f kubernetes/graphite-controller.json

Start Targets-io service

kubectl create -f kubernetes/targets-io-service.json

Start Targets-io controller

kubectl create -f kubernetes/targets-io-controller.json


Open firewall for Targetsio port 3000

gcloud compute firewall-rules create targetsio-3000 --allow=tcp:3000

Open firewall for Graphite port 80

gcloud compute firewall-rules create graphite-80 --allow=tcp:80


Open firewall for port 3000



kubectl create -f kubernetes/targets-io-controller.json