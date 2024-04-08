variable "aws_region" {
  type        = string
  description = "aws region"
  default     = "ap-southeast-1"
}

variable "app_name" {
  type        = string
  description = "name of app"
  default     = "vendor-twitter-proj1"
}

variable "public_subnets" {
  default = ["10.10.100.0/24", "10.10.101.0/24"]
}

variable "private_subnets" {
  default = ["10.10.0.0/24", "10.10.1.0/24"]
}

variable "availability_zones" {
  default = ["ap-southeast-1a", "ap-southeast-1b"]
}

#manually add vpc and subnet id
# .env to esc_env_vars.json then manually upload to s3(with that name)
# variable "aws_vpc_id" {
#   type        = string
#   description = "Aws VPC id deployed for network repo"
#   default     = "" #vpc_id
# }
#
# variable "aws_public_subnet_ids" {
#   description = "public subnet ids"
#   default     = ["", ""] #subnet id
# }
# variable "aws_private_subnet_ids" {
#   description = "private subnet ids"
#   default     = ["", ""] #subnet id
# }
# variable "aws_region" {
#   type        = string
#   description = "aws region"
#   default     = "ap-southeast-1"
# }
# variable "app_name" {
#   type        = string
#   description = "Application name"
#   default     = "vendor-proj1"
# }

variable "esc_twitter_env_secret_key" { #env ko store
  description = "Secret key file"
  default     = "esc_env_vars.json"

}

variable "esc_twitter_env_secret_folder" { # s3name
  description = "Secret s3 folder "
  default     = "vendor-twitter-secrets"
}

variable "dynamo_vendor_table_name" {
  description = " table name of dynamo vendor"
  default     = "vendors"
}

variable "sqs_que_name" {
  description = " name for sqs name"
  default     = "vendor-twitter-queue"
}

variable "image_tag" {}
