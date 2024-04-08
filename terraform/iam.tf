## NOTE: role - tasks execution role
data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:assumerole"]
    principals {
      type        = "service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecstasksexecutionrole" {
  name               = "${var.app_name}-ecs-tasks-execution-role-v2"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

# policy 1 for ec2
resource "aws_iam_role_policy_attachment" "ec2_policy" {
  role       = aws_iam_role.ecstasksexecutionrole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/amazonec2containerserviceforec2role"
}

# policy 2
# data "aws_iam_policy_document" "twitter_service_access" { statement {
#     effect = "allow"
#     actions = [
#       "dynamodb:describetable",
#       "dynamodb:scan",
#       "dynamodb:updateitem",
#       "sqs:*"
#     ]
#     resources = [
#       "arn:aws:sqs: ${var.aws_region}:${local.account_id}:${var.sqs_que_name}",
#       "arn:aws:dynamodb:${var.aws_region}:${local.account_id}:table/${var.dynamo_vendor_table_name}"
#     ]
#   }
# }
data "aws_iam_policy_document" "twitter_service_access" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:DescribeTable",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
      "sqs:*"
    ]
    resources = [
      "arn:aws:sqs:${var.aws_region}:${local.account_id}:${var.sqs_que_name}",
      "arn:aws:dynamodb:${var.aws_region}:${local.account_id}:table/${var.dynamo_vendor_table_name}"
    ]
  }
}

resource "aws_iam_policy" "twitter_service_access" {
  name        = "${var.app_name}-twitter_service_access"
  policy      = data.aws_iam_policy_document.twitter_service_access.json
  description = "allow access dynamodb and sqs for twitter service"
}
resource "aws_iam_role_policy_attachment" "attach_twitter_service_access_policy" {
  policy_arn = aws_iam_policy.twitter_service_access.arn
  role       = aws_iam_role.ecstasksexecutionrole.name
}
