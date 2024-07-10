build-image:
	@yarn compile
	@yarn bundle:prod
	@docker build -t yhzai-sa:latest .
	@aws ecr get-login-password | docker login --username AWS --password-stdin 414118545568.dkr.ecr.us-east-2.amazonaws.com
	@docker tag yhzai-sa:latest 414118545568.dkr.ecr.us-east-2.amazonaws.com/yhzai-sa:latest
	@docker push 414118545568.dkr.ecr.us-east-2.amazonaws.com/yhzai-sa:latest