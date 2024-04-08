resource "aws_ecs_cluster" "cluster" {
  name = "${var.app_name}-ecs_cluster"
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "${var.app_name}-ecs_logs"
}

resource "aws_security_group" "ecs_sg" {
  name   = "${var.app_name}-ecs_sg"
  vpc_id = aws_vpc.vpc.id

  ingress = {
    from_port      = 0
    to_port        = 0
    protocol       = "-1"
    security_group = [aws_security_group.lb_sg.id]
  }
  egress = {
    from_port       = 0
    to_port         = 0
    protocol        = "-1" #NOTE: mean all protocol
    cidr_block      = ["0.0.0.0/0"]
    ipv5_cidr_block = ["::/0"]
  }

}
