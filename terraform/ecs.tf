resource "aws_ecs_cluster" "cluster" {
  name = "${var.app_name}-ecs_cluster"
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "${var.app_name}-ecs_logs"
}

resource "aws_security_group" "ecs_sg" {
  name   = "${var.app_name}-ecs_sg"
  vpc_id = aws_vpc.vpc.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.lb_sg.id]
  }
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1" #NOTE: mean all protocol
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

}

data "aws_s3_object" "secrets" {
  key    = var.esc_twitter_env_secret_key
  bucket = var.esc_twitter_env_secret_folder
}

resource "aws_ecs_task_definition" "td" {
  family                = "${var.app_name}-td"
  container_definitions = <<DEFINITION
  [
    {
      "name": "${var.app_name}-td",
      "image": "${local.account_id}.dkr.ecr.us-east-1.amazonaws.com/twitter:${var.image_tag}",
      "entryPoint": [],
      "environment": ${data.aws_s3_object.secrets.body},
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.ecs_logs.id}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "${var.app_name}"
        }
      },
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ],
      "cpu": 256,
      "memory": 1024,
      "networkMode": "awsvpc"
    }
  ]
  DEFINITION

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = "1024"
  cpu                      = "256"
  execution_role_arn       = aws_iam_role.ecsTasksExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTasksExecutionRole.arn
}

data "aws_ecs_task_definition" "td" {
  task_definition = aws_ecs_task_definition.td.family
}

resource "aws_ecs_service" "ecs" {
  name                 = "${var.app_name}-ecs-service"
  cluster              = aws_ecs_cluster.cluster.id
  task_definition      = data.aws_ecs_task_definition.td.family
  launch_type          = "FARGATE"
  scheduling_strategy  = "REPLICA"
  desired_count        = 1
  force_new_deployment = true

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    assign_public_ip = false
    security_groups = [
      aws_security_group.ecs_sg.id,
      aws_security_group.lb_sg.id
    ]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_tg.arn
    container_name   = "${var.app_name}-td"
    container_port   = 80
  }

  depends_on = [
    aws_lb_listener.listener
  ]
}

resource "aws_appautoscaling_target" "autoscaling" {
  max_capacity       = 1
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.ecs.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
