FROM node
RUN apt-get update && apt-get install -y git git-core vim 
RUN useradd -Ums /bin/bash app
ENV HOME /home/app
WORKDIR /home/app
USER app
ADD package.json $HOME
ADD index.js $HOME
ADD post-receive $HOME
RUN npm install
RUN mkdir $HOME/repos
CMD ["node", "index.js"]
EXPOSE 8080
