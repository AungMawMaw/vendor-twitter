terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"


    }
  }
  backend "s3" {}
}

provider "aws" {
  # Configuration options
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# output "account_id" {
#   value = "${data.aws_caller_identity.current.account_id}"
# }
#
locals {
  account_id = data.aws_caller_identity.current.account_id
}


