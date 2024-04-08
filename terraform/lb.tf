variable "security_group_id" {}
#
# data "aws_security_group" "lb_sg" {
#   vpc_id = var.security_group_id
#   name   = "${var.app_name}-lb_sg"
#
# }
#
# resource "aws_subnet" "subnet" {
#   vpc_id     = data.aws_security_group.lb_sg.vpc_id
#   cidr_block = "10.0.1.0/24"
# }
resource "aws_security_group" "lb_sg" {
  name   = "${var.app_name}-lb_sg"
  vpc_id = aws_vpc.vpc.id

  ingress = {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    cidr_block      = ["0.0.0.0/0"]
    ipv5_cidr_block = ["::/0"]
  }
  egress = {
    from_port       = 0
    to_port         = 0
    protocol        = "-1" #NOTE: mean all protocol
    cidr_block      = ["0.0.0.0/0"]
    ipv5_cidr_block = ["::/0"]
  }
}
resource "aws_alb" "alb" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  # subnets            = aws_public_subnet_ids
  subnets         = aws_subnet.public_1.id
  security_groups = [aws_security_group.lb_sg.id]
}

resource "aws_alb_target_group" "alb_tg" {
  name        = "${var.app_name}-alb_tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.vpc.id

  health_check {
    healthy_threshold   = "2"
    unhealthy_threshold = "2"
    interval            = "200"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/"
    port                = "80"
  }
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.alb.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.alb_tg.arn
  }
}
